'use strict';
const $ = id => document.getElementById(id);
let stage=0, unlocked=0, impression='', soundIndex=0, questCount=0;
let soundTimer=null, coverTimer=null, questTimer=null;
const sounds=[['CHATTER','Two people talking nearby'],['SCRAAAPE','A chair moves across the floor'],['HA HA HA','Laughter from the next group'],['CLINK · CLINK','Cups and saucers at the counter']];
function clearTimers(){clearInterval(soundTimer);clearTimeout(coverTimer);clearInterval(questTimer);soundTimer=coverTimer=questTimer=null;}
function showSound(){clearTimeout(coverTimer);const sound=sounds[soundIndex++%sounds.length];$('sound-word').textContent=sound[0];$('sound-detail').textContent=sound[1];$('sound-cover').hidden=false;$('order-sound-word').textContent=sound[0];$('order-sound-detail').textContent=sound[1];$('order-sound').hidden=false;coverTimer=setTimeout(()=>{$('sound-cover').hidden=true;$('order-sound').hidden=true;},3500);}
function showQuest(){questCount++;$('quest-number').textContent=String(questCount).padStart(2,'0');$('quest-title').textContent=questCount===1?'The sugar packets are not lined up.':'One sugar packet is turned the wrong way again.';$('quest-card').hidden=false;}
function syncConditions(){clearTimers();$('sound-cover').hidden=true;$('order-sound').hidden=true;$('quest-card').hidden=true;if($('masking').checked){showSound();soundTimer=setInterval(showSound,7500);}if($('quests').checked){showQuest();questTimer=setInterval(showQuest,9000);}$('condition-status').textContent=($('masking').checked||$('quests').checked)?'Distractions are active. Your main task stays the same. Stop or press Esc at any time.':'Words are visible. Side-task notices are paused.';}
function quiet(){$('masking').checked=false;$('quests').checked=false;syncConditions();}
$('masking').onchange=syncConditions;$('quests').onchange=syncConditions;
$('barriers').onclick=()=>{$('masking').checked=true;$('quests').checked=true;syncConditions();};
$('stop').onclick=quiet;
$('support').onclick=()=>{quiet();$('condition-status').textContent='Support added: visible words, written instructions, and time to respond.';$('quest-feedback').textContent='The sugar packets can wait. Your menu choices and conversation have been kept.';};
$('sound-once').onclick=showSound;
$('repeat').onclick=()=>{clearTimeout(coverTimer);$('sound-cover').hidden=true;$('order-sound').hidden=true;clearInterval(soundTimer);if($('masking').checked)soundTimer=setInterval(showSound,7500);$('condition-status').textContent='The words are visible again. Take a moment to reread them.';};
$('align').onclick=()=>{$('quest-card').hidden=true;$('quest-feedback').textContent='Sugar packets lined up. Return to the conversation. Another notice may appear while side tasks are on.';};
$('defer').onclick=()=>{$('quest-card').hidden=true;$('quest-feedback').textContent='Side task set aside for now. You can continue choosing your meal.';};
document.addEventListener('keydown',e=>{if(e.key==='Escape')quiet();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)quiet();});

function button(text,action,parent){const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=action;parent.append(b);return b;}
function paragraph(text,parent){const p=document.createElement('p');p.textContent=text;parent.append(p);return p;}
function advance(n){unlocked=Math.max(unlocked,n);renderStage(n);}
function renderStage(n){
 if(n>unlocked)return;stage=n;
 const titles=['First impression','Both perspectives','Repair the exchange','Compare the conditions'];
 $('stage-heading').textContent=titles[n];$('counter').textContent='0'+(n+1)+' / 04';
 document.querySelectorAll('[data-stage]').forEach(b=>{b.disabled=Number(b.dataset.stage)>unlocked;b.setAttribute('aria-pressed',String(Number(b.dataset.stage)===n));});
 $('perspectives').hidden=n!==1;$('comparison').hidden=n!==3;
 const panel=$('discussion');panel.replaceChildren();
 if(n===0){paragraph('What is your first impression of the pause and the question?',panel);const choices=document.createElement('div');choices.className='choices';panel.append(choices);['Rude','Uninterested','Anxious','Processing the question','Unsure'].forEach(label=>{const b=button(label,()=>{impression=label;renderStage(0);},choices);b.setAttribute('aria-pressed',String(impression===label));});paragraph(impression?'That is one interpretation, not a conclusion. What context might be missing?':'Choose an impression, then look at the same moment from both sides.',panel);button('Explore both perspectives →',()=>advance(1),panel).disabled=!impression;}
 if(n===1){paragraph('Neither person can directly see the other person’s demands or intentions. A pause or a shifting gaze can be read in different ways.',panel);button('Try repairing the exchange →',()=>advance(2),panel);}
 if(n===2){paragraph('What could the barista say next to make the exchange easier to follow?',panel);const choices=document.createElement('div');choices.className='choices';panel.append(choices);const feedback=paragraph('Choose a response to explore its effect.',panel);const next=button('Compare with support →',()=>{quiet();advance(3);},panel);next.disabled=true;
 [['“Just hurry up.”',false],['“Are you ready yet?”',false],['“Take your time. Choose a drink and a food item, then tell me if you are eating in or taking away.”',true],['“Would you like me to write that down and move somewhere quieter?”',true]].forEach(([label,helpful])=>button(label,()=>{feedback.textContent=helpful?'This offers concrete information or a choice of support. Ask which support the person prefers.':'This adds pressure without resolving the ambiguous instruction. Try a more explicit or supportive response.';next.disabled=!helpful;},choices));}
 if(n===3){paragraph('The distractions are now off. Continue the same ordering task. Was it easier to follow the exchange? You can turn distractions back on to compare.',panel);button('Restart the conversation',()=>{unlocked=0;impression='';resetConversation();renderStage(0);},panel);}
}
document.querySelectorAll('[data-stage]').forEach(b=>b.onclick=()=>renderStage(Number(b.dataset.stage)));
$('reset').onclick=()=>{quiet();$('order-form').reset();resetConversation();questCount=0;soundIndex=0;unlocked=0;impression='';$('task-feedback').textContent='Choose your meal, then send your order to complete the task.';$('quest-feedback').textContent='';renderStage(0);};
renderStage(0);
const exchanges=[
 {barista:'How are we doing today?',reply:'I’m… deciding whether you mean my day or my order.'},
 {barista:'No worries. The usual is fine.',reply:'Which drink is the usual one?'},
 {barista:'What would you like to order?',order:true}
];
let conversationStep=0,orderSent=false;
function orderReady(){return ['drink','food','service'].every(id=>$(id).value);}
function orderLine(){return 'I’d like a '+$('drink').value.toLowerCase()+', a '+$('food').value.toLowerCase()+', '+($('service').value==='Eat in'?'to eat in':'to take away')+', please.';}
function message(who,words){const row=document.createElement('article');if(who==='You')row.className='you';const name=document.createElement('b');name.textContent=who;row.append(name);paragraph('“'+words+'”',row);$('dialogue').append(row);$('dialogue').scrollTop=$('dialogue').scrollHeight;}
function updateDraft(){
 const turn=exchanges[conversationStep];
 $('send-reply').disabled=orderSent||!!(turn.order&&!orderReady());
 $('send-reply').textContent=turn.order?'Send order':'Send reply';
 $('reply-draft').textContent=orderSent?'Your order has been sent.':turn.order?(orderReady()?orderLine():'Choose your drink, food, and service before sending your order.'):turn.reply;
 $('reply-status').textContent=orderSent?'Task complete.':turn.order?'This draft updates when you change the menu. It is only sent when you press Send order.':'Press Send reply to say this line and continue.';
}
function resetConversation(){conversationStep=0;orderSent=false;$('task-feedback').textContent='Choose your meal, then send your order to complete the task.';$('dialogue').replaceChildren();['drink','food','service'].forEach(id=>$(id).disabled=false);message('Barista',exchanges[0].barista);updateDraft();}
$('send-reply').onclick=()=>{
 if(orderSent)return;
 const turn=exchanges[conversationStep];
 if(turn.order&&!orderReady())return;
 message('You',turn.order?orderLine():turn.reply);
 if(turn.order){orderSent=true;message('Barista','Thank you. That is one '+$('drink').value.toLowerCase()+' and one '+$('food').value.toLowerCase()+', '+($('service').value==='Eat in'?'to eat in':'to take away')+'.');$('task-feedback').textContent='Task complete: you selected your meal and sent your full order.';['drink','food','service'].forEach(id=>$(id).disabled=true);}
 else{conversationStep++;message('Barista',exchanges[conversationStep].barista);}
 updateDraft();
};
['drink','food','service'].forEach(id=>$(id).onchange=()=>{updateDraft();$('task-feedback').textContent=orderReady()?'Meal selected. Continue the conversation, then press Send order to complete the task.':'Choose a drink, food, and eat-in or takeaway.';});
$('order-form').onsubmit=e=>e.preventDefault();
resetConversation();
