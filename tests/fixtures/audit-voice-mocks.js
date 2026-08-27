// Test-only fixtures, injected by audit-voice-server.cjs; never imported by ETOS.
(() => {
  let mode='pending', grant, deny, recognition, requests=0, stops=0;
  const enableSpeech=enabled=>document.querySelectorAll('[data-qa-speech]').forEach(button=>{button.disabled=!enabled;});
  const update=()=>{const out=document.getElementById('qa-voice-state');if(out)out.textContent=`requests=${requests} stops=${stops}`;};
  const stream=()=>{const track={readyState:'live',enabled:true,onended:null,stop(){this.readyState='ended';stops++;update();}};return {getTracks:()=>[track],getAudioTracks:()=>[track]};};
  Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia(){
    requests++;update();
    if(mode==='denied')return Promise.reject(new DOMException('Test denial','NotAllowedError'));
    if(mode==='pending')return new Promise((resolve,reject)=>{grant=()=>resolve(stream());deny=()=>reject(new DOMException('Test denial','NotAllowedError'));});
    return Promise.resolve(stream());
  }}});
  window.SpeechRecognition=class {
    constructor(){recognition=this;}
    start(){setTimeout(()=>{this.onstart?.();if(mode==='api-error')this.onerror?.({error:'audio-capture'});else if(mode!=='init-hang'&&this.onaudiostart){this.onaudiostart();enableSpeech(true);}},50);}
    abort(){enableSpeech(false);this.onend?.();}
  };
  document.addEventListener('DOMContentLoaded',()=>{
    const panel=document.createElement('aside');panel.id='audit-test-controls';
    panel.style.cssText='position:fixed;bottom:0;left:0;z-index:200;background:#222;color:white;font:11px monospace;padding:3px;display:flex;gap:4px;align-items:center';
    panel.innerHTML='<label>TEST API <select aria-label="Test microphone scenario"><option>pending</option><option>granted</option><option>denied</option><option>api-error</option><option>init-hang</option></select></label><button>Grant microphone</button><button>Deny microphone</button><button>Speak initialize</button><button>Speak wrong</button><button>Page interruption</button><output id="qa-voice-state"></output>';
    panel.querySelector('select').onchange=event=>{mode=event.target.value;};
    const buttons=panel.querySelectorAll('button');
    buttons[2].setAttribute('data-qa-speech','');buttons[2].disabled=true;buttons[3].setAttribute('data-qa-speech','');buttons[3].disabled=true;
    buttons[0].onclick=()=>grant?.();buttons[1].onclick=()=>deny?.();
    buttons[2].onclick=()=>recognition?.onresult?.({resultIndex:0,results:[[{transcript:'initialize'}]]});
    buttons[3].onclick=()=>recognition?.onresult?.({resultIndex:0,results:[[{transcript:'wrong'}]]});
    buttons[4].onclick=()=>{window.dispatchEvent(new Event('pagehide'));window.dispatchEvent(new Event('pageshow'));};
    // Exercise the unchanged 3-second production pointer handlers, not private functions.
    for(const [label,selector] of [['Hold Audit port','[data-audit-token-port]'],['Hold Warden heading','#terminal-title']]){
      const button=document.createElement('button');button.textContent=label;
      button.onclick=()=>{
        const target=document.querySelector(selector),r=target.getBoundingClientRect();
        const hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
        if(!target.contains(hit)){document.getElementById('qa-voice-state').textContent='HOLD TARGET BLOCKED';return;}
        target.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:77,pointerType:'touch',button:0}));
        setTimeout(()=>target.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:77,pointerType:'touch',button:0})),3100);
      };
      panel.append(button);
    }
    document.body.append(panel);update();
  });
})();
