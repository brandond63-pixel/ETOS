(() => {
  'use strict';

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const AUDIO_SCRIPT_URL = document.currentScript?.src || new URL('js/audio.js',document.baseURI).href;
  const AUDIO_BUILD_VERSION = new URL(AUDIO_SCRIPT_URL).searchParams.get('v');
  const resolveAudioAsset = relativePath => {
    const url=new URL(relativePath,AUDIO_SCRIPT_URL);
    if(AUDIO_BUILD_VERSION)url.searchParams.set('v',AUDIO_BUILD_VERSION);
    return url.href;
  };
  const SAMPLE_PATHS = {
    mechanicalActuation: 'assets/audio/09B_heavy_lock_disengage.wav',
    hardwareFault: 'assets/audio/10C_jammed_mechanism_chatter.wav',
    sanitizationWarningPulse: resolveAudioAsset('../assets/audio/ETOS_sanitization_warning_pulse.wav'),
    facilityEmergencyAlarm: resolveAudioAsset('../assets/audio/699248__mozfoo__emergency-alarm.wav'),
    recoveryIntro: resolveAudioAsset('../assets/audio/Intro.mp3')
  };
  const volumes = {master:.72,ambient:.16,music:.12,ui:.28,system:.34,mechanical:.38,sanitization:1};
  let context = null;
  let buses = null;
  let unlocked = false;
  const samples = new Map();
  const sampleLoads = new Map();
  const assetStatus = {};
  let ambient = null;
  let ambientStartPromise = null;
  let ambientRequest = 0;
  let ambientTargetLevel = 1;
  let recoveryMusic = null;
  let recoveryMusicRequest = 0;
  let biometricScanner = null;
  let biometricScannerRequest = 0;
  const auditTokenNodes = new Set();
  const sanitizationWarningNodes = new Set();
  let sanitizationWarningRequest = 0;
  let facilityAlarm = null;
  let facilityAlarmPromise = null;
  let facilityAlarmRequest = 0;
  let facilityAlarmTest = null;
  let facilityAlarmTestTimer = null;
  const FACILITY_ALARM_GAIN = 1;
  const FACILITY_ALARM_DUCK_GAIN = .22;
  const FACILITY_ALARM_FADE_MS = 350;
  const WARNING_PULSE_BASE_GAIN = .78;
  const WARNING_PULSE_INTENSITY_GAIN = .16;

  const now = () => context?.currentTime || 0;
  const random = (min,max) => min + Math.random() * (max-min);
  const safe = callback => { try { return callback(); } catch(error) { console.warn('ETOS audio unavailable:',error); return null; } };

  function makeGain(value,destination){
    const node=context.createGain();
    node.gain.value=value;
    node.connect(destination);
    return node;
  }

  function ensureContext(){
    if(context || !AudioContextClass) return context;
    context = new AudioContextClass({latencyHint:'interactive'});
    const master=makeGain(volumes.master,context.destination);
    buses={
      master,
      ambient:makeGain(volumes.ambient,master),
      music:makeGain(volumes.music,master),
      ui:makeGain(volumes.ui,master),
      system:makeGain(volumes.system,master),
      mechanical:makeGain(volumes.mechanical,master),
      sanitization:makeGain(volumes.sanitization,master)
    };
    console.info('[AudioDebug] working click URL = [synthesized Web Audio oscillator; no asset URL]');
    console.info('[AudioDebug] working hum URL = [synthesized Web Audio oscillators/noise; no asset URL]');
    console.info(`[AudioDebug] mechanical asset URL = ${new URL(SAMPLE_PATHS.mechanicalActuation,document.baseURI).href}`);
    console.info(`[AudioDebug] warning URL = ${new URL(SAMPLE_PATHS.sanitizationWarningPulse,document.baseURI).href}`);
    console.info(`[AudioDebug] facility URL = ${new URL(SAMPLE_PATHS.facilityEmergencyAlarm,document.baseURI).href}`);
    return context;
  }

  function decodeAudioData(arrayBuffer){
    return new Promise((resolve,reject)=>{
      const result=context.decodeAudioData(arrayBuffer,resolve,reject);
      if(result?.then)result.then(resolve,reject);
    });
  }

  function setAssetStatus(name,status){
    assetStatus[name]={...(assetStatus[name]||{}),...status};
    const key=name==='sanitizationWarningPulse'?'warningWav':name==='facilityEmergencyAlarm'?'facilityWav':`${name}Wav`,current=assetStatus[name];
    document.documentElement.dataset[`${key}State`]=current.state||'unchecked';
    document.documentElement.dataset[`${key}Status`]=current.status==null?'':String(current.status);
    document.documentElement.dataset[`${key}Bytes`]=String(current.bytes||0);
    document.documentElement.dataset[`${key}Type`]=current.contentType||'';
    document.documentElement.dataset[`${key}Duration`]=String(current.duration||0);
    document.dispatchEvent(new CustomEvent('etos-audio-asset-status',{detail:{name,...assetStatus[name]}}));
  }

  function isWaveData(arrayBuffer){
    if(arrayBuffer.byteLength<44)return false;
    const bytes=new Uint8Array(arrayBuffer);
    return String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WAVE';
  }

  async function loadSample(name,{force=false}={}){
    if(!context||!SAMPLE_PATHS[name])return false;
    if(!force&&samples.has(name))return true;
    if(sampleLoads.has(name)){
      if(!force)return sampleLoads.get(name);
      await sampleLoads.get(name);
    }
    if(force)samples.delete(name);
    const path=SAMPLE_PATHS[name],url=new URL(path,document.baseURI).href,debugLabel=name==='sanitizationWarningPulse'?'warning':name==='facilityEmergencyAlarm'?'facility':name;
    const promise=(async()=>{
      setAssetStatus(name,{state:'loading',result:'CHECKING',url,status:null,contentType:'',bytes:0,decode:'PENDING',duration:0,error:''});
      try{
        let response;
        try{response=await fetch(url,{cache:'no-store'});}catch(error){error.assetResult='FETCH FAILED';error.assetDecode='NOT ATTEMPTED';throw error;}
        const contentType=(response.headers.get('content-type')||'').toLowerCase();
        let arrayBuffer;
        try{arrayBuffer=await response.arrayBuffer();}catch(error){error.assetResult='FETCH FAILED';error.assetDecode='NOT ATTEMPTED';throw error;}
        const bytes=arrayBuffer.byteLength,waveData=isWaveData(arrayBuffer),headerText=new TextDecoder().decode(arrayBuffer.slice(0,96)).trimStart().toLowerCase();
        setAssetStatus(name,{state:'loading',result:'CHECKING',url,status:response.status,contentType,bytes,decode:'PENDING',error:''});
        console.info(`[AudioDebug] ${debugLabel} fetch status: ${response.status}`);
        console.info(`[AudioDebug] ${debugLabel} content type: ${contentType||'[missing]'}`);
        console.info(`[AudioDebug] ${debugLabel} bytes: ${bytes}`);
        const fail=(result,message,decode='NOT ATTEMPTED')=>{const error=new Error(message);error.assetResult=result;error.assetDecode=decode;throw error;};
        if(!response.ok)fail(`HTTP ${response.status}`,`HTTP ${response.status} for ${url}`);
        if(!bytes)fail('ZERO BYTE RESPONSE',`zero-byte response for ${url}`);
        if(contentType.includes('text/html')||headerText.startsWith('<!doctype html')||headerText.startsWith('<html'))fail('INVALID RESPONSE: APP HTML',`app HTML returned for ${url}`);
        const compatibleMime=contentType.startsWith('audio/')||contentType.includes('application/octet-stream')||contentType.includes('binary/octet-stream');
        if(!compatibleMime)fail(`WRONG MIME: ${contentType||'[MISSING]'}`,`unexpected content type ${contentType||'[missing]'} for ${url}`);
        if(name!=='recoveryIntro'&&!waveData)fail('INVALID RESPONSE: NOT WAV',`response is not RIFF/WAVE audio for ${url}`);
        let decoded;
        try{decoded=await decodeAudioData(arrayBuffer.slice(0));}catch(error){error.assetResult='DECODE FAILED';error.assetDecode='FAILED';throw error;}
        if(!decoded||!decoded.duration)fail('DECODE FAILED',`decoded buffer is empty for ${url}`,'FAILED');
        samples.set(name,decoded);
        setAssetStatus(name,{state:'loaded',result:'READY',url,status:response.status,contentType,bytes,decode:'READY',duration:decoded.duration,error:''});
        console.info(`[AudioDebug] ${debugLabel} decoded: ${decoded.duration.toFixed(3)} sec`);
        return true;
      }catch(error){
        samples.delete(name);setAssetStatus(name,{state:'failed',result:error.assetResult||'FETCH FAILED',url,decode:error.assetDecode||'NOT ATTEMPTED',error:String(error?.message||error)});
        const label=name==='sanitizationWarningPulse'?'WARNING':name==='facilityEmergencyAlarm'?'FACILITY':name==='recoveryIntro'?'RECOVERY INTRO':name;
        console.error(`[AudioDebug] ${label} AUDIO LOAD FAILED`,error);
        return false;
      }finally{sampleLoads.delete(name);document.documentElement.dataset.etosAudioSamples=String(samples.size);}
    })();
    sampleLoads.set(name,promise);
    return promise;
  }

  function loadSamples(names=Object.keys(SAMPLE_PATHS),options={}){
    return Promise.all(names.map(name=>loadSample(name,options)));
  }

  async function unlock(){
    if(!ensureContext())return false;
    try{
      if(context.state==='suspended')await context.resume();
      const source=context.createBufferSource();
      const gain=makeGain(0,buses.master);
      source.buffer=context.createBuffer(1,1,context.sampleRate);
      source.connect(gain);source.start();source.stop(now()+.01);
      unlocked=context.state==='running';
      document.documentElement.dataset.etosAudio=unlocked?'unlocked':'suspended';
      void loadSamples(Object.keys(SAMPLE_PATHS).filter(name=>name!=='recoveryIntro'));
      return unlocked;
    }catch(error){document.documentElement.dataset.etosAudio='unavailable';console.warn('ETOS audio could not unlock:',error);return false;}
  }

  async function prepareSanitizationAudio({force=false,names=['sanitizationWarningPulse','facilityEmergencyAlarm']}={}){
    try{
      if(!await unlock())throw new Error(`AudioContext state is ${context?.state||'unavailable'}`);
      await loadSamples(names,{force});
      const warningReady=samples.has('sanitizationWarningPulse'),alarmReady=samples.has('facilityEmergencyAlarm');
      document.documentElement.dataset.sanitizationAudio=warningReady&&alarmReady?'ready':warningReady||alarmReady?'partial':'incomplete';
      if(names.includes('sanitizationWarningPulse')&&!warningReady)throw new Error('warning WAV unavailable');
      if(names.includes('facilityEmergencyAlarm')&&!alarmReady)throw new Error('facility WAV unavailable');
      return true;
    }catch(error){console.error('[SanitizationAudio] playback failed:',error);return false;}
  }

  function tone({frequency=440,endFrequency=frequency,duration=.08,gain=.08,type='sine',bus='ui',delay=0,track=null}){
    if(!unlocked||!context||context.state!=='running')return;
    const start=now()+Math.max(0,delay),stop=start+duration;
    const oscillator=context.createOscillator(),level=context.createGain();
    oscillator.type=type;
    oscillator.frequency.setValueAtTime(Math.max(20,frequency),start);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(20,endFrequency),stop);
    level.gain.setValueAtTime(.0001,start);
    level.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),start+.006);
    level.gain.exponentialRampToValueAtTime(.0001,stop);
    oscillator.connect(level);level.connect(buses[bus]||buses.system);
    if(track){track.add(oscillator);oscillator.onended=()=>track.delete(oscillator);}
    oscillator.start(start);oscillator.stop(stop+.02);
    return oscillator;
  }

  function playCryoTypeTick(){
    if(!context||!buses)return false;
    if(context.state!=='running'&&context.state!=='closed')void context.resume().catch(()=>undefined);
    const start=context.currentTime,oscillator=context.createOscillator(),gain=context.createGain();
    oscillator.type='square';
    oscillator.frequency.setValueAtTime(760+Math.random()*110,start);
    gain.gain.setValueAtTime(.0001,start);
    gain.gain.exponentialRampToValueAtTime(.008,start+.005);
    gain.gain.exponentialRampToValueAtTime(.0001,start+.018);
    oscillator.connect(gain).connect(buses.master);
    oscillator.start(start);oscillator.stop(start+.048);
    return oscillator;
  }

  function rampGain(parameter,target,fadeMs){
    if(!context)return;
    const time=now(),level=Math.max(.0001,target),duration=Math.max(0,fadeMs)/1000;
    if(typeof parameter.cancelAndHoldAtTime==='function')parameter.cancelAndHoldAtTime(time);
    else{const current=Math.max(.0001,parameter.value);parameter.cancelScheduledValues(time);parameter.setValueAtTime(current,time);}
    if(duration)parameter.exponentialRampToValueAtTime(level,time+duration);
    else parameter.setValueAtTime(level,time);
  }

  function setAmbientLevel(level,{fadeMs=0}={}){
    ambientTargetLevel=Math.max(.0001,Math.min(1,Number(level)||0));
    if(ambient?.output)rampGain(ambient.output.gain,ambientTargetLevel,fadeMs);
  }

  function disposeRecoveryMusic({fadeMs=0}={}){
    const cue=recoveryMusic;recoveryMusic=null;
    if(!cue){document.documentElement.dataset.recoveryMusic='off';return Promise.resolve(false);}
    document.documentElement.dataset.recoveryMusic=fadeMs>0?'fading':'off';
    if(context)rampGain(cue.output.gain,.0001,fadeMs);
    return new Promise(resolve=>setTimeout(()=>{
      safe(()=>cue.source.stop());safe(()=>cue.source.disconnect());safe(()=>cue.output.disconnect());
      if(!recoveryMusic)document.documentElement.dataset.recoveryMusic='off';resolve(true);
    },Math.max(0,fadeMs)+40));
  }

  async function startRecoveryMusic({fadeInMs=2000}={}){
    const request=++recoveryMusicRequest;
    void disposeRecoveryMusic();
    setAmbientLevel(.28,{fadeMs:1200});
    void startAmbient({fadeMs:1200});
    if(!unlocked&&!await unlock())return false;
    if(!await loadSample('recoveryIntro')||request!==recoveryMusicRequest||!context||context.state!=='running')return false;
    const source=context.createBufferSource(),output=makeGain(.0001,buses.music);
    source.buffer=samples.get('recoveryIntro');source.loop=false;source.connect(output);
    const cue={source,output,request};recoveryMusic=cue;
    source.onended=()=>{if(recoveryMusic===cue){recoveryMusic=null;document.documentElement.dataset.recoveryMusic='ended';}safe(()=>source.disconnect());safe(()=>output.disconnect());};
    rampGain(output.gain,1,fadeInMs);source.start(0);
    document.documentElement.dataset.recoveryMusic='playing';
    return true;
  }

  function finishRecoveryAudio({fadeMs=1800}={}){
    recoveryMusicRequest+=1;
    setAmbientLevel(1,{fadeMs});
    return disposeRecoveryMusic({fadeMs});
  }

  function noiseBurst({duration=.12,gain=.035,frequency=1200,bus='system',delay=0,q=.7,track=null}){
    if(!unlocked||!context||context.state!=='running')return;
    const frames=Math.max(1,Math.floor(context.sampleRate*duration)),buffer=context.createBuffer(1,frames,context.sampleRate),data=buffer.getChannelData(0);
    for(let i=0;i<frames;i++)data[i]=(Math.random()*2-1)*(1-i/frames);
    const source=context.createBufferSource(),filter=context.createBiquadFilter(),level=context.createGain(),start=now()+delay;
    filter.type='bandpass';filter.frequency.value=frequency;filter.Q.value=q;level.gain.value=gain;
    source.buffer=buffer;source.connect(filter);filter.connect(level);level.connect(buses[bus]||buses.system);if(track){track.add(source);source.onended=()=>track.delete(source);}source.start(start);return source;
  }

  function stopAuditToken(){auditTokenNodes.forEach(node=>safe(()=>node.stop()));auditTokenNodes.clear();}
  function stopSanitizationWarning(){sanitizationWarningRequest+=1;sanitizationWarningNodes.forEach(node=>safe(()=>node.stop()));sanitizationWarningNodes.clear();}

  function stopBiometricScan(){
    biometricScannerRequest+=1;
    if(!biometricScanner){document.documentElement.dataset.biometricScannerAudio='off';return;}
    const scanner=biometricScanner;biometricScanner=null;clearTimeout(scanner.tickTimer);
    scanner.ticks.forEach(node=>safe(()=>node.stop()));scanner.ticks.clear();
    if(context){
      const time=now();scanner.output.gain.cancelScheduledValues(time);scanner.output.gain.setValueAtTime(Math.max(.0001,scanner.output.gain.value),time);scanner.output.gain.exponentialRampToValueAtTime(.0001,time+.045);
    }
    setTimeout(()=>safe(()=>{scanner.hum.stop();scanner.body.stop();scanner.sweep?.stop();scanner.lfo?.stop();scanner.output.disconnect();}),60);
    document.documentElement.dataset.biometricScannerAudio='off';
    console.info('[BiometricAudio] scanner stopped');
  }

  async function startBiometricScan(){
    stopBiometricScan();
    const request=biometricScannerRequest;
    if(!unlocked&&!await unlock())return false;
    if(request!==biometricScannerRequest||!context||context.state!=='running')return false;
    const output=makeGain(.0001,buses.system),hum=context.createOscillator(),humLevel=makeGain(.042,output),body=context.createOscillator(),bodyLevel=makeGain(.014,output);
    hum.type='sine';hum.frequency.value=108;body.type='triangle';body.frequency.value=216;
    hum.connect(humLevel);body.connect(bodyLevel);hum.start();body.start();
    const time=now();output.gain.exponentialRampToValueAtTime(1,time+.075);
    biometricScanner={output,hum,body,sweep:null,lfo:null,tickTimer:null,ticks:new Set(),sweeping:false};
    document.documentElement.dataset.biometricScannerAudio='contact';
    console.info('[BiometricAudio] contact hum started');
    return true;
  }

  async function startBiometricSweep(){
    if(!biometricScanner&&!await startBiometricScan())return false;
    const scanner=biometricScanner;
    if(!scanner||scanner.sweeping)return !!scanner;
    scanner.sweeping=true;
    const sweep=context.createOscillator(),sweepLevel=makeGain(.019,scanner.output),lfo=context.createOscillator(),lfoDepth=context.createGain();
    sweep.type='triangle';sweep.frequency.value=515;sweep.connect(sweepLevel);
    lfo.type='sine';lfo.frequency.value=1/1.3;lfoDepth.gain.value=.008;lfo.connect(lfoDepth);lfoDepth.connect(sweepLevel.gain);
    sweep.start();lfo.start();scanner.sweep=sweep;scanner.lfo=lfo;
    const tick=()=>{
      if(biometricScanner!==scanner||!scanner.sweeping)return;
      tone({frequency:820,endFrequency:875,duration:.026,gain:.012,type:'square',bus:'system',track:scanner.ticks});
      scanner.tickTimer=setTimeout(tick,620+Math.random()*180);
    };
    scanner.tickTimer=setTimeout(tick,280);
    document.documentElement.dataset.biometricScannerAudio='scanning';
    console.info('[BiometricAudio] scan sweep started');
    return true;
  }

  function completeBiometricScan(){
    stopBiometricScan();
    if(!unlocked||!context||context.state!=='running')return false;
    tone({frequency:535,endFrequency:735,duration:.145,gain:.058,type:'triangle',bus:'system'});
    document.documentElement.dataset.biometricScannerAudio='verified';
    console.info('[BiometricAudio] live operator verified chirp');
    return true;
  }

  function sample(name,{delay=0,gain=1,rate=1,bus='mechanical',track=null,direct=false}={}){
    if(!unlocked||!context||context.state!=='running')return;
    const buffer=samples.get(name);if(!buffer)return;
    try{
      const source=context.createBufferSource(),level=context.createGain(),filter=context.createBiquadFilter();
      source.buffer=buffer;source.playbackRate.value=rate;level.gain.value=gain;filter.type='lowpass';filter.frequency.value=6200;filter.Q.value=.35;
      if(direct){source.connect(level);level.connect(context.destination);}else{source.connect(filter);filter.connect(level);level.connect(buses[bus]||buses.system);}if(track){track.add(source);source.onended=()=>track.delete(source);}source.start(now()+Math.max(0,delay));return source;
    }catch(error){console.error(`[SanitizationAudio] PLAYBACK REJECTED: ${name}`,error);return null;}
  }

  function logSanitizationGainChain(kind,sourceGain,direct=true){
    const route=direct?'audioContext.destination':'sanitization bus → master → destination';
    console.info(`[SanitizationAudio] ${kind} gain chain: source=${sourceGain.toFixed(2)}, sanitization=${volumes.sanitization.toFixed(2)}, master=${volumes.master.toFixed(2)}, duck=${kind==='facility'&&facilityAlarm?facilityAlarm.level.gain.value.toFixed(2):'1.00'}, route=${route}, context=${context?.state||'unavailable'}`);
  }

  async function playSanitizationWarningPulse(){
    const request=sanitizationWarningRequest;
    if(!unlocked&&!await unlock())return false;
    if(!samples.has('sanitizationWarningPulse'))await loadSample('sanitizationWarningPulse');
    if(request!==sanitizationWarningRequest){console.info('[SanitizationAudio] warning source SKIPPED - controller stopped during load');return false;}
    const source=sample('sanitizationWarningPulse',{gain:1,bus:'sanitization',track:sanitizationWarningNodes,direct:true});
    if(!source){console.error('[SanitizationAudio] warning source FAILED TO START');return false;}
    document.documentElement.dataset.sanitizationWarningPlayback='playing';
    logSanitizationGainChain('warning',1,true);
    console.info('[SanitizationAudio] warning source STARTED');
    source.onended=()=>{sanitizationWarningNodes.delete(source);if(!sanitizationWarningNodes.size)document.documentElement.dataset.sanitizationWarningPlayback='idle';};
    return true;
  }

  function setFacilityAlarmState(state,detail={}){
    document.documentElement.dataset.facilityAlarm=state;
    document.dispatchEvent(new CustomEvent('etos-facility-alarm-state',{detail:{state,...detail}}));
  }

  function clearFacilityAlarmTimers(alarm){
    if(!alarm)return;
    if(alarm.autoStopTimer)clearTimeout(alarm.autoStopTimer);
    if(alarm.fadeTimer)clearTimeout(alarm.fadeTimer);
    alarm.autoStopTimer=null;alarm.fadeTimer=null;
  }

  function releaseFacilityAlarm(alarm,{stopSource=true,reason='stopped'}={}){
    if(!alarm)return;
    clearFacilityAlarmTimers(alarm);
    if(facilityAlarm===alarm)facilityAlarm=null;
    if(stopSource)safe(()=>alarm.source.stop());
    safe(()=>alarm.source.disconnect());safe(()=>alarm.filter.disconnect());safe(()=>alarm.level.disconnect());
    setFacilityAlarmState('off',{reason});
    console.info(`[SanitizationAudio] facility alarm stopped // ${reason}`);
  }

  function scheduleFacilityAlarmStop(alarm,autoStopMs){
    if(!alarm||!Number.isFinite(autoStopMs)||autoStopMs<=0)return;
    alarm.autoStopTimer=setTimeout(()=>{
      if(facilityAlarm===alarm)stopFacilityAlarm({fadeMs:FACILITY_ALARM_FADE_MS,reason:'automatic cutoff'});
    },autoStopMs);
  }

  async function startFacilityAlarm({mode='activation',autoStopMs=15000}={}){
    if(facilityAlarm){
      const alarm=facilityAlarm;clearFacilityAlarmTimers(alarm);alarm.mode=mode;
      if(context){const time=now(),gain=alarm.level.gain;gain.cancelScheduledValues(time);gain.setValueAtTime(Math.max(.0001,gain.value),time);gain.linearRampToValueAtTime(FACILITY_ALARM_GAIN,time+.12);}
      if(mode==='activation')scheduleFacilityAlarmStop(alarm,autoStopMs);
      setFacilityAlarmState('active',{mode,reused:true});
      console.info(`[SanitizationAudio] facility alarm continuing // ${mode}`);
      return true;
    }
    if(facilityAlarmPromise)return facilityAlarmPromise.then(()=>startFacilityAlarm({mode,autoStopMs}));
    const request=facilityAlarmRequest;
    facilityAlarmPromise=(async()=>{
      try{
        if(!unlocked&&!await unlock())throw new Error(`AudioContext state is ${context?.state||'unavailable'}`);
        await loadSamples();
        if(request!==facilityAlarmRequest)return false;
        if(facilityAlarm)return true;
        const buffer=samples.get('facilityEmergencyAlarm');
        if(!buffer)throw new Error(`missing decoded asset: ${SAMPLE_PATHS.facilityEmergencyAlarm}`);
        const source=context.createBufferSource(),level=context.createGain(),filter=context.createBiquadFilter();
        source.buffer=buffer;source.loop=true;level.gain.value=1;filter.type='lowpass';filter.frequency.value=6100;filter.Q.value=.28;
        console.info('[SanitizationAudio] facility alarm play requested');
        source.connect(level);level.connect(context.destination);source.start();
        const alarm={source,level,filter,mode,autoStopTimer:null,fadeTimer:null};facilityAlarm=alarm;
        source.onended=()=>{if(facilityAlarm===alarm)releaseFacilityAlarm(alarm,{stopSource:false,reason:'source ended'});};
        if(mode==='activation')scheduleFacilityAlarmStop(alarm,autoStopMs);
        setFacilityAlarmState('active',{mode});
        logSanitizationGainChain('facility',1,true);
        console.info('[SanitizationAudio] facility source STARTED');
        return true;
      }catch(error){setFacilityAlarmState('failed',{mode,error:String(error?.message||error)});console.error('[SanitizationAudio] FACILITY ALARM PLAYBACK REJECTED',error);return false;}
    })().finally(()=>{facilityAlarmPromise=null;});
    return facilityAlarmPromise;
  }

  function stopFacilityAlarm({fadeMs=FACILITY_ALARM_FADE_MS,reason='manual stop'}={}){
    facilityAlarmRequest+=1;
    const alarm=facilityAlarm;
    if(!alarm){setFacilityAlarmState('off',{reason});return false;}
    clearFacilityAlarmTimers(alarm);
    if(!context||fadeMs<=0){releaseFacilityAlarm(alarm,{reason});return true;}
    const time=now(),gain=alarm.level.gain,duration=Math.max(.05,fadeMs/1000);
    gain.cancelScheduledValues(time);gain.setValueAtTime(Math.max(.0001,gain.value),time);gain.linearRampToValueAtTime(.0001,time+duration);
    setFacilityAlarmState('fading',{reason,fadeMs});
    alarm.fadeTimer=setTimeout(()=>{if(facilityAlarm===alarm)releaseFacilityAlarm(alarm,{reason});},fadeMs+35);
    console.info(`[SanitizationAudio] facility alarm fading // ${reason}`);
    return true;
  }

  function duckFacilityAlarm(){
    if(!facilityAlarm||!context)return false;
    const alarm=facilityAlarm,gain=alarm.level.gain,time=now();
    gain.cancelScheduledValues(time);gain.setValueAtTime(Math.max(.0001,gain.value),time);gain.linearRampToValueAtTime(FACILITY_ALARM_DUCK_GAIN,time+.08);gain.setValueAtTime(FACILITY_ALARM_DUCK_GAIN,time+.48);gain.linearRampToValueAtTime(FACILITY_ALARM_GAIN,time+.86);
    setFacilityAlarmState('ducking',{mode:alarm.mode});
    setTimeout(()=>{if(facilityAlarm===alarm&&!alarm.fadeTimer)setFacilityAlarmState('active',{mode:alarm.mode});},880);
    return true;
  }

  function restoreFacilityAlarm(){
    if(!facilityAlarm||!context)return false;
    const alarm=facilityAlarm,gain=alarm.level.gain,time=now();
    gain.cancelScheduledValues(time);gain.setValueAtTime(Math.max(.0001,gain.value),time);gain.linearRampToValueAtTime(FACILITY_ALARM_GAIN,time+.3);
    setTimeout(()=>{if(facilityAlarm===alarm&&!alarm.fadeTimer)setFacilityAlarmState('active',{mode:alarm.mode});},320);
    return true;
  }

  async function testSanitizationWarning(){
    console.info('[SanitizationAudio] warning play requested (Warden test)');
    if(!await prepareSanitizationAudio({force:true,names:['sanitizationWarningPulse']}))return false;
    const source=sample('sanitizationWarningPulse',{gain:1,bus:'sanitization',direct:true});
    if(!source){console.error('[SanitizationAudio] WARNING PLAYBACK REJECTED');return false;}
    document.documentElement.dataset.sanitizationWarningTest='playing';
    source.onended=()=>{document.documentElement.dataset.sanitizationWarningTest='complete';console.info('[SanitizationAudio] warning test playback complete');};
    logSanitizationGainChain('warning test',1,true);console.info('[SanitizationAudio] warning test source STARTED');
    return true;
  }

  function stopFacilityAlarmTest(){
    if(facilityAlarmTestTimer)clearTimeout(facilityAlarmTestTimer);
    facilityAlarmTestTimer=null;
    if(facilityAlarmTest){const test=facilityAlarmTest;facilityAlarmTest=null;safe(()=>test.source.stop());safe(()=>test.source.disconnect());safe(()=>test.filter.disconnect());safe(()=>test.level.disconnect());}
    document.documentElement.dataset.facilityAlarmTest='off';
    console.info('[SanitizationAudio] facility alarm test stopped');
  }

  async function toggleFacilityAlarmTest(){
    if(facilityAlarmTest){stopFacilityAlarmTest();return false;}
    console.info('[SanitizationAudio] facility alarm play requested (Warden test)');
    if(!await prepareSanitizationAudio({force:true,names:['facilityEmergencyAlarm']}))return false;
    try{
      const buffer=samples.get('facilityEmergencyAlarm');
      if(!buffer)throw new Error(`missing decoded asset: ${SAMPLE_PATHS.facilityEmergencyAlarm}`);
      const source=context.createBufferSource(),level=context.createGain(),filter=context.createBiquadFilter();
      source.buffer=buffer;source.loop=true;level.gain.value=1;filter.type='lowpass';filter.frequency.value=6100;filter.Q.value=.28;
      source.connect(level);level.connect(context.destination);
      source.onended=()=>{if(facilityAlarmTest?.source===source){facilityAlarmTest=null;document.documentElement.dataset.facilityAlarmTest='off';}};
      source.start();facilityAlarmTest={source,level,filter};
      document.documentElement.dataset.facilityAlarmTest='playing';
      facilityAlarmTestTimer=setTimeout(stopFacilityAlarmTest,7000);
      logSanitizationGainChain('facility test',1,true);console.info('[SanitizationAudio] facility test source STARTED');
      return true;
    }catch(error){document.documentElement.dataset.facilityAlarmTest='failed';console.error('[SanitizationAudio] FACILITY ALARM PLAYBACK REJECTED',error);return false;}
  }

  function equipmentTick(){
    if(!ambient)return;
    tone({frequency:random(150,205),endFrequency:random(125,170),duration:random(.025,.045),gain:.012,type:'square',bus:'ambient'});
    ambient.tickTimer=setTimeout(equipmentTick,random(12000,35000));
  }

  function driftAmbient(){
    if(!ambient||!context)return;
    const time=now(),duration=random(6,11);
    ambient.base.detune.cancelScheduledValues(time);ambient.base.detune.linearRampToValueAtTime(random(-9,9),time+duration);
    ambient.harmonic.detune.cancelScheduledValues(time);ambient.harmonic.detune.linearRampToValueAtTime(random(-14,14),time+duration*.86);
    ambient.harmonicGain.gain.cancelScheduledValues(time);ambient.harmonicGain.gain.linearRampToValueAtTime(random(.012,.028),time+duration);
    ambient.noiseGain.gain.cancelScheduledValues(time);ambient.noiseGain.gain.linearRampToValueAtTime(random(.012,.024),time+duration*.72);
    ambient.driftTimer=setTimeout(driftAmbient,duration*1000);
  }

  async function startAmbient({level=ambientTargetLevel,fadeMs=2400}={}){
    setAmbientLevel(level,{fadeMs});
    if(ambient)return true;
    if(ambientStartPromise)return ambientStartPromise;
    const request=ambientRequest;
    ambientStartPromise=(async()=>{
    if(!unlocked&&!await unlock())return false;
    if(request!==ambientRequest)return false;
    if(ambient)return true;
    const output=makeGain(.0001,buses.ambient),base=context.createOscillator(),harmonic=context.createOscillator(),baseGain=makeGain(.055,output),harmonicGain=makeGain(.018,output);
    base.type='sine';base.frequency.value=random(57,62);harmonic.type='sine';harmonic.frequency.value=base.frequency.value*2;
    base.connect(baseGain);harmonic.connect(harmonicGain);
    const noiseFrames=context.sampleRate*2,noiseBuffer=context.createBuffer(1,noiseFrames,context.sampleRate),noiseData=noiseBuffer.getChannelData(0);
    for(let i=0;i<noiseFrames;i++)noiseData[i]=Math.random()*2-1;
    const noise=context.createBufferSource(),noiseFilter=context.createBiquadFilter(),noiseGain=makeGain(.016,output);
    noise.buffer=noiseBuffer;noise.loop=true;noiseFilter.type='lowpass';noiseFilter.frequency.value=430;noiseFilter.Q.value=.25;noise.connect(noiseFilter);noiseFilter.connect(noiseGain);
    const time=now();output.gain.setValueAtTime(.0001,time);output.gain.exponentialRampToValueAtTime(ambientTargetLevel,time+Math.max(0,fadeMs)/1000);
    base.start();harmonic.start();noise.start();
    ambient={output,base,harmonic,noise,harmonicGain,noiseGain,driftTimer:null,tickTimer:null};
    document.documentElement.dataset.etosAudioAmbient='on';
    driftAmbient();ambient.tickTimer=setTimeout(equipmentTick,random(12000,35000));return true;
    })();
    try{return await ambientStartPromise;}finally{ambientStartPromise=null;}
  }

  function stopAmbient(){
    ambientRequest+=1;
    ambientTargetLevel=1;
    if(!ambient||!context)return;
    const bed=ambient;ambient=null;clearTimeout(bed.driftTimer);clearTimeout(bed.tickTimer);
    document.documentElement.dataset.etosAudioAmbient='off';
    const time=now();bed.output.gain.cancelScheduledValues(time);bed.output.gain.setValueAtTime(Math.max(.0001,bed.output.gain.value),time);bed.output.gain.exponentialRampToValueAtTime(.0001,time+.65);
    setTimeout(()=>safe(()=>{bed.base.stop();bed.harmonic.stop();bed.noise.stop();bed.output.disconnect();}),720);
  }

  function play(name,options={}){
    if(!unlocked||!context||context.state!=='running')return false;
    document.documentElement.dataset.etosAudioLast=name;
    const delay=options.delay||0;
    switch(name){
      case 'uiSelect': {const f=[720,790,850][Math.floor(Math.random()*3)];tone({frequency:f,endFrequency:f*random(.94,1.03),duration:random(.045,.068),gain:random(.055,.07),type:'square',bus:'ui',delay});break;}
      case 'uiBack': tone({frequency:520,endFrequency:405,duration:.078,gain:.052,type:'triangle',bus:'ui',delay});break;
      case 'confirm': tone({frequency:440,endFrequency:470,duration:.09,gain:.065,type:'triangle',bus:'system',delay});tone({frequency:620,endFrequency:675,duration:.12,gain:.07,type:'triangle',bus:'system',delay:delay+.09});break;
      case 'reject': tone({frequency:270,endFrequency:165,duration:.24,gain:.075,type:'sawtooth',bus:'system',delay});noiseBurst({duration:.16,gain:.014,frequency:310,bus:'system',delay:delay+.04});break;
      case 'restricted': tone({frequency:205,endFrequency:185,duration:.11,gain:.07,type:'square',bus:'system',delay});tone({frequency:175,endFrequency:158,duration:.13,gain:.075,type:'square',bus:'system',delay:delay+.17});break;
      case 'process': tone({frequency:options.frequency||335,endFrequency:(options.frequency||335)*1.06,duration:.105,gain:.045,type:'triangle',bus:'system',delay});break;
      case 'dataPacket': noiseBurst({duration:.13,gain:.018,frequency:1450,bus:'system',delay,q:1.2});tone({frequency:920,endFrequency:780,duration:.075,gain:.025,type:'square',bus:'system',delay:delay+.025});break;
      case 'mediaClick': tone({frequency:185,endFrequency:158,duration:.032,gain:.035,type:'square',bus:'mechanical',delay});break;
      case 'mediaSeek': noiseBurst({duration:.2,gain:.018,frequency:920,bus:'mechanical',delay,q:1.5});[0,.08,.19,.31].forEach((offset,index)=>tone({frequency:165+index*19,endFrequency:148+index*13,duration:.035,gain:.026,type:'square',bus:'mechanical',delay:delay+offset}));break;
      case 'mediaConfirm': tone({frequency:330,endFrequency:365,duration:.08,gain:.05,type:'triangle',bus:'system',delay});tone({frequency:515,endFrequency:548,duration:.11,gain:.052,type:'triangle',bus:'system',delay:delay+.09});break;
      case 'mediaAuthenticate': [0,.12,.29,.48].forEach((offset,index)=>tone({frequency:285+index*54,endFrequency:300+index*58,duration:.075,gain:.038,type:'square',bus:'system',delay:delay+offset}));break;
      case 'mediaReadWrite': noiseBurst({duration:.07,gain:.012,frequency:random(820,1450),bus:'mechanical',delay,q:1.7});tone({frequency:random(125,210),endFrequency:random(115,180),duration:.027,gain:.018,type:'square',bus:'mechanical',delay});break;
      case 'mediaErase': noiseBurst({duration:.09,gain:.014,frequency:random(540,980),bus:'mechanical',delay,q:1.1});tone({frequency:random(115,165),endFrequency:random(95,130),duration:.045,gain:.022,type:'sawtooth',bus:'mechanical',delay});break;
      case 'mediaComplete': tone({frequency:275,endFrequency:310,duration:.11,gain:.05,type:'triangle',bus:'system',delay});tone({frequency:415,endFrequency:470,duration:.14,gain:.055,type:'triangle',bus:'system',delay:delay+.12});sample('mechanicalActuation',{delay:delay+.28,gain:.25,rate:1.25});break;
      case 'injectorSeat': noiseBurst({duration:.32,gain:.018,frequency:480,bus:'mechanical',delay,q:.55});tone({frequency:145,endFrequency:118,duration:.38,gain:.035,type:'sawtooth',bus:'mechanical',delay});break;
      case 'injectorPrime': tone({frequency:132,endFrequency:176,duration:.7,gain:.045,type:'sawtooth',bus:'mechanical',delay});noiseBurst({duration:.48,gain:.018,frequency:620,bus:'mechanical',delay:delay+.5,q:.6});tone({frequency:410,endFrequency:438,duration:.12,gain:.04,type:'square',bus:'system',delay:delay+1.35});tone({frequency:385,endFrequency:420,duration:.12,gain:.04,type:'square',bus:'system',delay:delay+2.45});break;
      case 'injectorComplete': sample('mechanicalActuation',{delay,gain:.32,rate:1.3});tone({frequency:228,endFrequency:158,duration:.34,gain:.058,type:'triangle',bus:'system',delay:delay+.16});break;
      case 'mechanicalActuation': sample(name,{delay,gain:options.gain??.72,rate:options.rate??1});break;
      case 'hardwareFault': sample(name,{delay,gain:options.gain??.68,rate:options.rate??1});break;
      case 'interlockAck': tone({frequency:315,endFrequency:350,duration:.13,gain:.055,type:'triangle',bus:'system',delay});tone({frequency:510,endFrequency:555,duration:.17,gain:.06,type:'triangle',bus:'system',delay:delay+.14});break;
      case 'auditDetect': tone({frequency:282,endFrequency:318,duration:.11,gain:.045,type:'triangle',bus:'system',delay,track:auditTokenNodes});tone({frequency:425,endFrequency:462,duration:.14,gain:.05,type:'triangle',bus:'system',delay:delay+.12,track:auditTokenNodes});break;
      case 'auditRead': noiseBurst({duration:.07,gain:.01,frequency:1180,bus:'system',delay,q:1.4,track:auditTokenNodes});tone({frequency:510,endFrequency:536,duration:.055,gain:.025,type:'square',bus:'system',delay:delay+.02,track:auditTokenNodes});break;
      case 'auditReject': tone({frequency:325,endFrequency:280,duration:.16,gain:.045,type:'triangle',bus:'system',delay,track:auditTokenNodes});break;
      case 'auditConfirm': tone({frequency:365,endFrequency:392,duration:.1,gain:.045,type:'triangle',bus:'system',delay,track:auditTokenNodes});tone({frequency:548,endFrequency:582,duration:.14,gain:.05,type:'triangle',bus:'system',delay:delay+.11,track:auditTokenNodes});break;
      case 'auditAcquire': [0,.1,.22].forEach((offset,index)=>tone({frequency:310+index*75,endFrequency:332+index*78,duration:.075,gain:.035,type:'square',bus:'system',delay:delay+offset,track:auditTokenNodes}));break;
      case 'auditComplete': tone({frequency:330,endFrequency:360,duration:.12,gain:.045,type:'triangle',bus:'system',delay,track:auditTokenNodes});tone({frequency:495,endFrequency:535,duration:.14,gain:.05,type:'triangle',bus:'system',delay:delay+.13,track:auditTokenNodes});tone({frequency:660,endFrequency:690,duration:.16,gain:.045,type:'triangle',bus:'system',delay:delay+.27,track:auditTokenNodes});break;
      case 'sanitizationPulse': void playSanitizationWarningPulse();break;
      case 'sanitizationExecute': tone({frequency:118,endFrequency:104,duration:.5,gain:.075,type:'sine',bus:'system',delay});tone({frequency:236,endFrequency:208,duration:.48,gain:.05,type:'triangle',bus:'system',delay:delay+.08});tone({frequency:354,endFrequency:312,duration:.44,gain:.04,type:'triangle',bus:'system',delay:delay+.16});break;
      case 'hackSequence': [285,355,445,560].forEach((frequency,index)=>tone({frequency,endFrequency:frequency*1.08,duration:.12,gain:.05,type:'triangle',bus:'system',delay:delay+.25+index*.8}));break;
      case 'researchReveal': tone({frequency:285,endFrequency:330,duration:.7,gain:.045,type:'sine',bus:'system',delay});tone({frequency:427,endFrequency:495,duration:.62,gain:.032,type:'triangle',bus:'system',delay:delay+.09});tone({frequency:640,endFrequency:618,duration:.25,gain:.03,type:'sine',bus:'system',delay:delay+.42});break;
      case 'pressureSweep': noiseBurst({duration:.62,gain:.03,frequency:520,bus:'system',delay,q:.35});break;
      case 'startup': tone({frequency:245,endFrequency:275,duration:.12,gain:.04,type:'triangle',bus:'system',delay});tone({frequency:365,endFrequency:405,duration:.14,gain:.05,type:'triangle',bus:'system',delay:delay+.16});tone({frequency:545,endFrequency:590,duration:.18,gain:.055,type:'triangle',bus:'system',delay:delay+.36});break;
      default:return false;
    }
    return true;
  }

  function setVolume(group,value){
    if(!(group in volumes))return;
    volumes[group]=Math.max(0,Math.min(1,Number(value)||0));
    if(buses?.[group])buses[group].gain.setTargetAtTime(volumes[group],now(),.04);
  }

  window.ETOSAudio={unlock,prepareSanitizationAudio,play,playCryoTypeTick,startRecoveryMusic,finishRecoveryAudio,startAmbient,stopAmbient,startBiometricScan,startBiometricSweep,stopBiometricScan,completeBiometricScan,stopAuditToken,stopSanitizationWarning,playSanitizationWarningPulse,startFacilityAlarm,stopFacilityAlarm,duckFacilityAlarm,restoreFacilityAlarm,testSanitizationWarning,toggleFacilityAlarmTest,stopFacilityAlarmTest,setVolume,getVolumes:()=>({...volumes}),getAssetStatus:()=>Object.fromEntries(Object.entries(assetStatus).map(([name,status])=>[name,{...status}])),isUnlocked:()=>unlocked};
  document.documentElement.dataset.etosAudio='ready';
})();
