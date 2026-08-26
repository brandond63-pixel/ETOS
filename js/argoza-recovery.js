(() => {
  'use strict';

  const STORAGE_KEY = 'etos.argoza.recovery-seen.v1';
  const NARRATIVE_LINE_FADE_IN = 420;
  const NARRATIVE_FINAL_HOLD = 1250;
  const NARRATIVE_FADE_OUT = 500;
  const NARRATIVE_GAP = 300;
  const BEAT_GAP = 650;
  const TYPE_SPEED = 32;
  let session = null;
  let runCounter = 0;

  const narrative = (lines, options = {}) => ({kind:'narrative',lines:Array.isArray(lines)?lines:[lines],...options});
  const etos = (lines, hold = 2500, options = {}) => ({kind:'etos',lines:Array.isArray(lines)?lines:[lines],hold,...options});

  const sequence = [
    narrative(['Black.','No stars. No ship. No sense of distance.','Only sound.']),
    narrative(['A low mechanical hum.','Air moving through vents.','A faint electronic pulse somewhere nearby.']),
    narrative(['Then a breath. Another.','Cold returns first. Then weight.','Then the awareness of your own body.']),
    narrative(['Your fingers feel heavy.','Your jaw aches.','Your mouth is dry.']),
    narrative(['Light begins to seep through the translucent cover above you.','Dim. Blue-white. Clinical.','A soft tone sounds. Then another.']),
    narrative(['The lid above you unlocks with a muted mechanical click.','Around the cryogenic bay, other pods begin the same sequence.','Displays illuminate. Seals release. Condensation slides down the inside of the glass.']),
    etos(['ETOS // CRYOGENIC RECOVERY','RECOVERY SEQUENCE COMPLETE','REMAIN STATIONARY UNTIL VESTIBULAR AND MOTOR FUNCTION RETURN TO ACCEPTABLE PARAMETERS'],3300),
    narrative(['The pod opens.','Cold air spills over the edge.','For several seconds, memory comes back only in fragments.']),
    narrative(['The Argoza. Ellison-Tanaka.','Transit.','A station somewhere very far away.','Then the obvious thought arrives.']),
    narrative('You shouldn’t be awake yet.',{className:'is-dramatic',finalHold:2250}),
    narrative(['Across the bay, two other cryogenic pods are opening.','Renfield sits upright slowly, blinking against the light.','Anders grips the edge of her pod and waits for the room to stop moving.','Neither of them looks any more informed than you feel.']),
    etos('TRANSIT STATUS: INTERRUPTED',3800,{className:'is-major'}),
    etos('YOUR SCHEDULED TRANSIT HAS BEEN INTERRUPTED UNDER ELLISON-TANAKA EMERGENCY-RESPONSE AUTHORITY',3000),
    etos(['ROUTE MODIFICATION CONFIRMED','CURRENT DESTINATION: ORISON / LV-872'],3000),
    etos('DURING LONG-RANGE TRANSIT, ELLISON-TANAKA OPERATIONS DETECTED A PRIORITY DISTRESS TRANSMISSION ORIGINATING FROM HORIZON BASE, ORISON',3300),
    etos('THE ETV ARGOZA HAS BEEN REDIRECTED TO PROVIDE RESPONSE SUPPORT',2800),
    etos('SUBSEQUENT COMMUNICATION WITH HORIZON BASE HAS BEEN LIMITED',2800),
    etos('SELECTED PERSONNEL ARE BEING RECOVERED FROM CRYOGENIC SUSPENSION IN PREPARATION FOR ARRIVAL',3000),
    narrative(['“Well, that’s new,” says Renfield as he rubs both hands over his face.','Anders stares at the destination display for another moment.','“Anybody remember Orison being on the itinerary?” she asks.','The question hangs in the air.']),
    narrative(['As feeling begins to return to your legs, the bay starts to feel less like a medical chamber and more like a ship again.','Fans cycle overhead.','Status lights shift from amber to green.','The low vibration of the Argoza travels steadily through the deck.']),
    narrative(['Another cryogenic pod stands several meters away.','Open.','Empty.','Its display is still illuminated.']),
    etos(['MAAS, D.','RECOVERY COMPLETE'],2800),
    narrative(['Renfield notices it.','“Maas beat us up,” he says.','Anders glances toward the empty pod.','“Looks like it.”']),
    etos(['POST-RECOVERY MOVEMENT RESTRICTIONS CLEARED','NORMAL SHIPBOARD ACTIVITY AUTHORIZED','SURFACE DEPLOYMENT: PENDING','MISSION BRIEFING: AVAILABLE','PERSONNEL ACCESS: ENABLED'],2800),
    etos('REVIEW UPDATED MISSION INFORMATION PRIOR TO ARRIVAL AT ORISON',2600),
    etos('NO IMMEDIATE ACTION REQUIRED',4200,{className:'is-major'}),
    narrative(['“Good,” says Renfield as he swings his legs over the side of the pod and carefully stands.','He tests his balance for a moment.','“I’m finding coffee before somebody invents another emergency.”','He heads for the exit.']),
    narrative(['Anders takes another moment before standing.','“I’m going forward,” she says. “See what they did to our flight plan.”','She looks back once. “See you around.”','Then she follows Renfield out.']),
    narrative(['The cryogenic bay grows quieter.','One by one, recovery systems enter standby.','The open pods remain behind.','Maas’s among them.']),
    narrative(['Outside the bay, the Argoza continues through deep space toward a world none of you expected to see.','There are still several days before arrival.','For now, the ship is yours.']),
    etos(['ETOS // ELLISON-TANAKA OPERATIONS SYSTEM','AUTHORIZED PERSONNEL ACCESS ENABLED','WELCOME ABOARD THE ETV ARGOZA'],2000,{final:true,className:'is-final'})
  ];

  function isSeen(){try{return localStorage.getItem(STORAGE_KEY)==='true';}catch{return false;}}
  function markSeen(){try{localStorage.setItem(STORAGE_KEY,'true');}catch{}}
  function resetSeen(){try{localStorage.removeItem(STORAGE_KEY);}catch{}}
  const active = id => !!session && session.id===id && !session.aborted;

  function settleWait(wait,result){
    if(wait.settled)return;wait.settled=true;clearTimeout(wait.timer);session?.waits.delete(wait);wait.resolve(result);
  }
  function armWait(wait){
    if(!session||session.paused||wait.settled)return;
    wait.started=performance.now();
    wait.timer=setTimeout(()=>settleWait(wait,true),Math.max(0,wait.remaining));
  }
  function delay(ms,id){
    if(!active(id))return Promise.resolve(false);
    return new Promise(resolve=>{const wait={remaining:Math.max(0,ms*session.speed),started:0,timer:null,resolve,settled:false};session.waits.add(wait);armWait(wait);});
  }
  function pauseWaits(){
    if(!session)return;session.waits.forEach(wait=>{if(wait.timer!==null){clearTimeout(wait.timer);wait.timer=null;wait.remaining=Math.max(0,wait.remaining-(performance.now()-wait.started));}});
  }
  function resumeWaits(){session?.waits.forEach(armWait);}
  function cancelActiveWork(){
    if(!session)return;session.aborted=true;session.waits.forEach(wait=>settleWait(wait,false));session.animations.forEach(animation=>{try{animation.cancel();}catch{}});session.animations.clear();
  }
  async function animate(element,keyframes,options,id){
    if(!active(id))return false;
    const animation=element.animate(keyframes,{...options,duration:Math.max(1,(options.duration||0)*session.speed),fill:'forwards'});
    session.animations.add(animation);if(session.paused)animation.pause();
    try{await animation.finished;}catch{return false;}finally{session?.animations.delete(animation);}
    return active(id);
  }
  async function showNarrative(step,id){
    if(!active(id))return false;
    const card=document.createElement('article');card.className=`argoza-recovery-narrative ${step.className||''}`.trim();
    const lines=step.lines.map(text=>{const line=document.createElement('p');line.textContent=text;line.style.opacity='0';card.append(line);return line;});session.stage.replaceChildren(card);
    for(let index=0;index<lines.length;index+=1){
      if(!await animate(lines[index],[{opacity:0,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}],{duration:NARRATIVE_LINE_FADE_IN,easing:'ease-out'},id))return false;
      if(index<lines.length-1){const words=step.lines[index].trim().split(/\s+/).length,cadence=words<=4?650:words<=10?850:words<=18?1100:1300;if(!await delay(cadence,id))return false;}
    }
    if(!await delay(step.finalHold??NARRATIVE_FINAL_HOLD,id))return false;
    if(!await animate(card,[{opacity:1},{opacity:0}],{duration:NARRATIVE_FADE_OUT,easing:'ease-in'},id))return false;
    session.stage.replaceChildren();return delay(NARRATIVE_GAP,id);
  }
  function addCursor(line){
    session.stage.querySelectorAll('.argoza-recovery-cursor').forEach(cursor=>cursor.remove());
    const cursor=document.createElement('span');cursor.className='argoza-recovery-cursor';cursor.setAttribute('aria-hidden','true');line.append(cursor);return cursor;
  }
  async function typeLine(text,block,id){
    const line=document.createElement('div');line.className='argoza-recovery-line';block.append(line);
    const cursor=addCursor(line),textNode=document.createTextNode('');line.insertBefore(textNode,cursor);
    for(let index=0;index<text.length;index+=1){
      if(!active(id))return false;textNode.data+=text[index];
      if(text[index]!==' '&&index%2===0)session.onTick?.(index,text[index]);
      if(!await delay(TYPE_SPEED*(.76+Math.random()*.42),id))return false;
    }
    cursor.remove();return delay(260,id);
  }
  async function showEtos(step,id){
    if(!active(id))return false;
    const block=document.createElement('section');block.className=`argoza-recovery-etos ${step.className||''}`.trim();session.stage.replaceChildren(block);
    for(const line of step.lines)if(!await typeLine(line,block,id))return false;
    if(!await delay(step.hold,id))return false;
    if(step.final)return true;
    if(!await animate(block,[{opacity:1},{opacity:0}],{duration:750,easing:'ease-in'},id))return false;
    session.stage.replaceChildren();return delay(BEAT_GAP,id);
  }
  function setPaused(paused){
    if(!session||session.finishing||session.paused===paused)return;
    session.paused=paused;session.overlay.classList.toggle('is-paused',paused);session.pauseButton.textContent=paused?'RESUME':'PAUSE';session.pauseButton.setAttribute('aria-pressed',String(paused));
    if(paused){pauseWaits();session.animations.forEach(animation=>animation.pause());}
    else{resumeWaits();session.animations.forEach(animation=>animation.play());}
  }
  async function finish(skipped=false){
    if(!session||session.finishing)return;const ending=session;ending.finishing=true;markSeen();cancelActiveWork();
    ending.pauseButton.disabled=true;ending.skipButton.disabled=true;ending.overlay.classList.remove('is-paused');
    const duration=(skipped?650:1800)*ending.speed;
    const fade=ending.overlay.animate([{opacity:1},{opacity:0}],{duration:Math.max(1,duration),fill:'forwards',easing:'ease-in-out'});
    try{await fade.finished;}catch{}
    ending.overlay.remove();if(session===ending)session=null;ending.onFinish?.({skipped});
  }
  async function run(id){
    for(const step of sequence){
      if(!active(id))return;
      const completed=step.kind==='narrative'?await showNarrative(step,id):await showEtos(step,id);
      if(!completed)return;
    }
    if(active(id))await finish(false);
  }
  function stop(){if(!session)return;const old=session;cancelActiveWork();old.overlay.remove();session=null;}
  function start({host,onFinish,onTick,speed=1}={}){
    if(!host)return false;stop();
    const overlay=document.createElement('section');overlay.className='argoza-recovery-overlay';overlay.dataset.argozaRecovery='';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','ETV Argoza cryogenic recovery sequence');
    overlay.innerHTML=`<header><span>ETOS // CRYOGENIC RECOVERY</span><div><button type="button" data-argoza-recovery-pause aria-pressed="false">PAUSE</button><button type="button" data-argoza-recovery-skip>SKIP</button></div></header><main class="argoza-recovery-stage" data-argoza-recovery-stage aria-live="polite"></main><footer><span>ETV ARGOZA // RECOVERY SYSTEM</span><span>ELLISON-TANAKA COLONIAL SYSTEMS</span></footer>`;
    host.append(overlay);
    const id=++runCounter,pauseButton=overlay.querySelector('[data-argoza-recovery-pause]'),skipButton=overlay.querySelector('[data-argoza-recovery-skip]');
    session={id,overlay,stage:overlay.querySelector('[data-argoza-recovery-stage]'),pauseButton,skipButton,onFinish,onTick,speed:Math.max(.001,Number(speed)||1),paused:false,aborted:false,finishing:false,waits:new Set(),animations:new Set()};
    pauseButton.addEventListener('click',()=>setPaused(!session?.paused));skipButton.addEventListener('click',()=>void finish(true));
    requestAnimationFrame(()=>{if(active(id))void run(id);});return true;
  }

  window.ETOSArgozaRecovery={start,stop,isSeen,resetSeen,isRunning:()=>!!session&&!session.finishing};
})();
