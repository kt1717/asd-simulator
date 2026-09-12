'use strict';
const $ = id => document.getElementById(id);
let stage=0, unlocked=0, impression='', soundIndex=0, questCount=0;
let soundTimer=null, coverTimer=null, questTimer=null;
const sounds=[['CHATTER','Two people talking nearby'],['SCRAAAPE','A chair moves across the floor'],['HA HA HA','Laughter from the next group'],['CLICK · CLICK','Someone clicks a pen']];
function clearTimers(){clearInterval(soundTimer);clearTimeout(coverTimer);clearInterval(questTimer);soundTimer=coverTimer=questTimer=null;}
function showSound(){clearTimeout(coverTimer);const sound=sounds[soundIndex++%sounds.length];$('sound-word').textContent=sound[0];$('sound-detail').textContent=sound[1];$('sound-cover').hidden=false;coverTimer=setTimeout(()=>$('sound-cover').hidden=true,3500);}
function showQuest(){questCount++;$('quest-number').textContent=String(questCount).padStart(2,'0');$('quest-title').textContent=questCount===1?'The pens are not lined up.':'One pen is out of line again.';$('quest-card').hidden=false;}
function syncConditions(){clearTimers();$('sound-cover').hidden=true;$('quest-card').hidden=true;if($('masking').checked){showSound();soundTimer=setInterval(showSound,6500);}if($('quests').checked){showQuest();questTimer=setInterval(showQuest,9000);}$('condition-status').textContent=($('masking').checked||$('quests').checked)?'Distractions are active. Your main task stays the same. Stop or press Esc at any time.':'Words are visible. Side-task notices are paused.';}
function quiet(){$('masking').checked=false;$('quests').checked=false;syncConditions();}
$('masking').onchange=syncConditions;$('quests').onchange=syncConditions;
$('barriers').onclick=()=>{$('masking').checked=true;$('quests').checked=true;syncConditions();};
$('stop').onclick=quiet;
$('support').onclick=()=>{quiet();$('condition-status').textContent='Support added: visible words, written instructions, and time to respond.';$('quest-feedback').textContent='The pens can wait. Your badge entries have been kept.';};
$('sound-once').onclick=showSound;
$('repeat').onclick=()=>{clearTimeout(coverTimer);$('sound-cover').hidden=true;clearInterval(soundTimer);if($('masking').checked)soundTimer=setInterval(showSound,6500);$('condition-status').textContent='The words are visible again. Take a moment to reread them.';};
$('align').onclick=()=>{$('quest-card').hidden=true;$('quest-feedback').textContent='Pens lined up. Return to the conversation. Another notice may appear while side tasks are on.';};
$('defer').onclick=()=>{$('quest-card').hidden=true;$('quest-feedback').textContent='Side task set aside for now. You can continue the badge.';};
document.addEventListener('keydown',e=>{if(e.key==='Escape')quiet();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)quiet();});
$('badge-form').onsubmit=e=>{e.preventDefault();const correct=$('guest').value.trim().toLowerCase()==='mia'&&$('colour').value==='Blue'&&$('table').value==='3';$('task-feedback').textContent=correct?'Badge ready: Mia · Blue · Table 3. You can keep exploring the conversation.':'Check the written instruction: Mia, a blue badge, table 3. There is no time limit.';};
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
 if(n===2){paragraph('What could the other guest say next to make the exchange easier to follow?',panel);const choices=document.createElement('div');choices.className='choices';panel.append(choices);const feedback=paragraph('Choose a response to explore its effect.',panel);const next=button('Compare with support →',()=>{quiet();advance(3);},panel);next.disabled=true;
 [['“Just hurry up.”',false],['“Are you ready yet?”',false],['“Take your time. Write Mia on a blue badge for table 3.”',true],['“Would you like me to write that down and move somewhere quieter?”',true]].forEach(([label,helpful])=>button(label,()=>{feedback.textContent=helpful?'This offers concrete information or a choice of support. Ask which support the person prefers.':'This adds pressure without resolving the ambiguous instruction. Try a more explicit or supportive response.';next.disabled=!helpful;},choices));}
 if(n===3){paragraph('The distractions are now off. Continue the same badge task. Was it easier to follow the exchange? You can turn distractions back on to compare.',panel);button('Restart the conversation',()=>{unlocked=0;impression='';renderStage(0);},panel);}
}
document.querySelectorAll('[data-stage]').forEach(b=>b.onclick=()=>renderStage(Number(b.dataset.stage)));
$('reset').onclick=()=>{quiet();$('badge-form').reset();questCount=0;soundIndex=0;unlocked=0;impression='';$('task-feedback').textContent='You can complete this while following the conversation.';$('quest-feedback').textContent='';renderStage(0);};
renderStage(0);
