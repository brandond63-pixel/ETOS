const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const source = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
const declarations = source.slice(source.indexOf("  let auditTokenView="), source.indexOf('  let sequenceResetStatusTimer='));
const functions = source.slice(source.indexOf('  const auditTokenState='), source.indexOf('  function resetCommandSequenceForDev('));
const constants = source.split(/\r?\n/).filter(l => /^  const AUDIT_TOKEN_(HOLD_MS|PASSCODE|DEFAULT) =/.test(l)).join('\n');
const flush = async () => { for (let n = 0; n < 5; n++) await Promise.resolve(); };
function events(target = {}) {
  const listeners = new Map();
  return Object.assign(target, {
    addEventListener(name, fn) { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name).add(fn); },
    removeEventListener(name, fn) { listeners.get(name)?.delete(fn); },
    emit(name) { for (const fn of [...(listeners.get(name) || [])]) fn(); },
    listenerCount() { return [...listeners.values()].reduce((n, set) => n + set.size, 0); }
  });
}
function harness(options = {}) {
  let now = 0, timerId = 0, requests = 0, grant, deny;
  const timers = new Map(), recognitions = [], cues = [], spoken = [];
  const track = { readyState: 'live', enabled: true, onended: null, stops: 0, stop() { this.stops++; this.readyState = 'ended'; } };
  const stream = { getTracks: () => [track], getAudioTracks: () => options.noTrack ? [] : [track] };
  const input = { value: '', focus() {} }, error = { textContent: '' };
  const document = events({ hidden: false, getElementById: () => input });
  const window = events({ ETOSAudio: { stopAuditToken() {} }, speechSynthesis: { cancel() {}, speak(utterance) { spoken.push(utterance.text); } } });
  class Recognition {
    constructor() { if (options.constructorThrow) throw Error('constructor'); recognitions.push(this); }
    start() { if (options.startThrow) throw Error('start'); if (options.startReject) return Promise.reject(Error('start')); }
    abort() { this.aborted = true; this.onend?.(); if (options.abortThrow) throw Error('abort'); }
    capture() { this.onstart?.(); this.onaudiostart?.(); }
    result(text) { this.onresult?.({ resultIndex: 0, results: [[{ transcript: text }]] }); }
  }
  if (!options.unsupported) window.SpeechRecognition = Recognition;
  const state = { auditToken: { connected: false, complete: false } };
  const navigator = { mediaDevices: { getUserMedia() {
    requests++;
    if (options.permissionThrow) throw Error('permission throw');
    if (options.denied) return Promise.reject({ name: 'NotAllowedError' });
    if (options.pending) return new Promise((resolve, reject) => { grant = () => resolve(stream); deny = reject; });
    return Promise.resolve(stream);
  } } };
  if (options.noMedia) delete navigator.mediaDevices;
  const context = vm.createContext({ window, document, navigator, state, console: { info() {} }, SpeechSynthesisUtterance: function(text) { this.text = text; },
    Date: { now: () => now }, setTimeout(fn, ms) { const id = ++timerId; timers.set(id, { fn, at: now + ms }); return id; }, clearTimeout(id) { timers.delete(id); },
    saveState() {}, playAudio(cue) { cues.push(cue); }, renderTerminal() {}, els: { workspace: { querySelector: () => error } }
  });
  const api = vm.runInContext(constants + declarations + functions + `\n({
    beginAuditTokenDetection,initializeAuditTokenVoice,showAuditTokenManualFallback,resetAuditTokenSession,suspendAuditTokenWorkflow,openConnectedAuditToken,authorizeAuditTokenPasscode,renderAuditTokenWorkflow,
    inspect:()=>({view:auditTokenView,phase:auditTokenVoicePhase,attempt:auditTokenVoiceAttempt,status:auditTokenVoiceStatus,microphone:auditTokenMicrophone,recognition:auditTokenRecognition,init:auditTokenInitTimer,listening:auditTokenRecognitionTimeout,timers:auditTokenTimers.size})
  })`, context);
  const advance = ms => { const end = now + ms; while (true) { const next = [...timers.entries()].filter(([,t]) => t.at <= end).sort((a,b) => a[1].at - b[1].at)[0]; if (!next) break; timers.delete(next[0]); now = next[1].at; next[1].fn(); } now = end; };
  const prepare = () => { api.beginAuditTokenDetection(); advance(2750); };
  const clean = (view = 'manual') => { const s = api.inspect(); assert.equal(s.view, view); assert.equal(s.phase, 'idle'); assert.equal(s.microphone, null); assert.equal(s.recognition, null); assert.equal(s.init, null); assert.equal(s.listening, null); assert.equal(s.timers, 0); assert.equal(window.listenerCount() + document.listenerCount(), 0); assert.equal(timers.size, 0); };
  return { api, prepare, advance, clean, recognitions, stream, track, window, document, input, error, cues, spoken, state, requests: () => requests, grant: () => grant(), deny: () => deny({ name: 'NotAllowedError' }), jump: ms => { now += ms; } };
}

test('detection waits for a user gesture; listening waits for permission AND audio capture', async () => {
  const h = harness({ pending: true }); h.prepare(); h.advance(5000);
  assert.equal(h.api.inspect().view, 'voice-ready'); assert.equal(h.requests(), 0);
  assert.match(h.api.renderAuditTokenWorkflow(), /INITIALIZE VOICE AUTHORIZATION/);
  const pending = h.api.initializeAuditTokenVoice();
  assert.equal(h.api.inspect().phase, 'permission'); assert.equal(h.api.inspect().listening, null);
  assert.doesNotMatch(h.api.renderAuditTokenWorkflow(), /is-listening/);
  assert.match(h.api.renderAuditTokenWorkflow(), /USE MANUAL AUTHENTICATION/);
  await h.api.initializeAuditTokenVoice(); assert.equal(h.requests(), 1);
  h.grant(); await pending;
  h.recognitions[0].onstart(); assert.equal(h.api.inspect().view, 'voice-initializing');
  h.recognitions[0].capture(); assert.equal(h.api.inspect().phase, 'listening');
  assert.equal(h.api.inspect().init, null); assert.notEqual(h.api.inspect().listening, null);
});
test('already-granted path preserves successful command, prompts, and confirmation', async () => {
  const h = harness(); h.prepare(); await h.api.initializeAuditTokenVoice(); h.recognitions[0].capture(); h.recognitions[0].result('Initialize!');
  assert.equal(h.api.inspect().view, 'authorized'); assert.equal(h.track.stops, 1);
  assert.deepEqual(h.spoken, ['Audit interface ready. State acquisition command.']);
  assert.ok(h.cues.includes('auditConfirm')); h.advance(1550); assert.equal(h.api.inspect().view, 'confirm');
});
test('three failed attempts reuse permission/stream and retain original cues and timings', async () => {
  const h = harness(); h.prepare(); await h.api.initializeAuditTokenVoice();
  for (let n = 0; n < 3; n++) { const r = h.recognitions[n]; r.capture(); assert.equal(h.api.inspect().attempt, n + 1); r.result('wrong command'); if (n < 2) h.advance(1800); }
  h.advance(1450); h.clean(); assert.equal(h.requests(), 1); assert.equal(h.track.stops, 1);
  assert.equal(h.cues.filter(c => c === 'auditReject').length, 3);
  assert.deepEqual(h.spoken, ['Audit interface ready. State acquisition command.', 'Command not recognized. Repeat acquisition command.', 'Command not recognized. Repeat acquisition command.']);
});
for (const [name, options] of Object.entries({ denied: { denied:true }, throws: { permissionThrow:true }, unsupported: { unsupported:true }, insecure: { noMedia:true }, noTrack: { noTrack:true }, constructor: { constructorThrow:true }, start: { startThrow:true }, rejectedStart: { startReject:true } })) {
  test(`${name} cleans up and leaves manual Verify and Abort usable`, async () => {
    const h = harness(options); h.prepare(); await h.api.initializeAuditTokenVoice(); await flush(); h.clean();
    h.input.value = 'wrong'; h.api.authorizeAuditTokenPasscode(); assert.equal(h.error.textContent, 'AUTHENTICATION REJECTED');
    h.input.value = 'hbadt872'; h.api.authorizeAuditTokenPasscode(); assert.equal(h.api.inspect().view, 'authorized');
    h.api.resetAuditTokenSession(); h.clean('closed'); assert.equal(h.api.renderAuditTokenWorkflow(), '');
    h.prepare(); assert.equal(h.api.inspect().view, 'voice-ready');
  });
}
test('dismissed/unresolved permission times out; a late grant is stopped and cannot reopen voice', async () => {
  const h = harness({ pending:true }); h.prepare(); const pending = h.api.initializeAuditTokenVoice(); h.advance(30000); h.clean(); h.grant(); await pending; h.clean(); assert.equal(h.track.stops, 1);
});
test('denial after pending permission resolves to manual', async () => {
  const h = harness({ pending:true }); h.prepare(); const pending = h.api.initializeAuditTokenVoice(); h.deny(); await pending; h.clean();
});
test('microphone granted but speech never captures audio hits the initialization timeout', async () => {
  const h = harness(); h.prepare(); await h.api.initializeAuditTokenVoice(); h.recognitions[0].onstart(); h.advance(30000); h.clean(); assert.equal(h.track.stops, 1); assert.equal(h.recognitions[0].onstart, null);
});
for (const event of ['network','not-allowed','audio-capture','service-not-allowed','aborted']) test(`${event} recognition error goes directly to clean manual fallback`, async () => {
  const h = harness({ abortThrow:true }); h.prepare(); await h.api.initializeAuditTokenVoice(); h.recognitions[0].capture(); h.recognitions[0].onerror({error:event}); h.clean(); assert.equal(h.track.stops, 1);
});
test('no-speech and normal recognition end still consume normal attempts', async () => {
  const h = harness(); h.prepare(); await h.api.initializeAuditTokenVoice(); h.recognitions[0].capture(); h.recognitions[0].onerror({error:'no-speech'}); h.advance(1800); h.recognitions[1].capture(); h.recognitions[1].onend(); h.advance(1800); h.recognitions[2].capture(); h.advance(8000 + 1450); h.clean();
});
test('recognition ending before capture never enters listening', async () => {
  const h=harness(); h.prepare(); await h.api.initializeAuditTokenVoice(); h.recognitions[0].onend(); h.clean(); assert.equal(h.spoken.length,0);
});
test('a stale result after Abort cannot authorize a new Token session', async () => {
  const h=harness(); h.prepare(); await h.api.initializeAuditTokenVoice(); h.recognitions[0].capture(); const stale=h.recognitions[0].onresult; h.api.resetAuditTokenSession(); h.prepare(); stale({resultIndex:0,results:[[{transcript:'initialize'}]]}); assert.equal(h.api.inspect().view,'voice-ready');
});
test('temporary permission-dialog visibility/focus loss can resume a granted microphone', async () => {
  const h = harness({pending:true}); h.prepare(); const pending = h.api.initializeAuditTokenVoice(); h.document.hidden=true; h.document.emit('visibilitychange'); h.grant(); await pending;
  assert.equal(h.api.inspect().phase, 'permission-granted'); assert.equal(h.recognitions.length, 0);
  h.document.hidden=false; h.document.emit('visibilitychange'); h.recognitions[0].capture(); h.window.emit('focus'); assert.equal(h.api.inspect().phase, 'listening');
  h.document.hidden=true; h.document.emit('visibilitychange'); h.document.hidden=false; h.window.emit('pageshow'); assert.equal(h.api.inspect().phase, 'listening');
});
test('wall-clock recovery works even when the OS suspends JS timers', async () => {
  const h = harness({pending:true}); h.prepare(); void h.api.initializeAuditTokenVoice(); h.document.hidden=true; h.jump(31000); h.document.hidden=false; h.window.emit('focus'); h.clean();
});
test('pagehide invalidates pending permission; stale return cannot resume voice', async () => {
  const h = harness({pending:true}); h.prepare(); const pending=h.api.initializeAuditTokenVoice(); h.window.emit('pagehide'); h.clean(); h.grant(); await pending; h.window.emit('pageshow'); h.clean(); assert.equal(h.track.stops,1);
});
test('manual selection, abort, and re-entry discard old promises and recognition callbacks', async () => {
  const h = harness({pending:true}); h.prepare(); const pending=h.api.initializeAuditTokenVoice(); h.api.resetAuditTokenSession(); h.clean('closed'); h.prepare(); h.grant(); await pending; assert.equal(h.api.inspect().view,'voice-ready'); assert.equal(h.track.stops,1);
  const live = harness(); live.prepare(); await live.api.initializeAuditTokenVoice(); const stale=live.recognitions[0].onaudiostart; live.api.showAuditTokenManualFallback(); live.clean(); stale(); live.clean();
  live.api.resetAuditTokenSession(); live.prepare(); assert.equal(live.api.inspect().view,'voice-ready');
});
test('manual fallback cancels retry timers and does not leave an asynchronous focus steal', async () => {
  const h=harness(); h.prepare(); await h.api.initializeAuditTokenVoice(); h.recognitions[0].capture(); h.recognitions[0].result('wrong'); h.api.showAuditTokenManualFallback(); h.advance(5000); h.clean(); assert.equal(h.recognitions.length,1);
});
test('track loss cleans up immediately and transfer suspension removes the protocol', async () => {
  const h=harness(); h.prepare(); await h.api.initializeAuditTokenVoice(); h.recognitions[0].capture(); h.track.readyState='ended'; h.track.onended(); h.clean(); h.api.suspendAuditTokenWorkflow(); h.clean('closed'); h.api.openConnectedAuditToken(); assert.equal(h.api.inspect().view,'voice-ready');
});
test('Warden access and compact abort styling are not replaced by global locks', () => {
  assert.match(source,/holdTimer=setTimeout\(openWarden,3000\)/);
  assert.doesNotMatch(functions,/inert|preventDefault|document\.body\.style|setInterval/);
  const css=fs.readFileSync(path.join(__dirname,'../css/themes/command.css'),'utf8');
  assert.match(css,/\.audit-token-layer--voice-preparation\{pointer-events:none\}/);
  assert.match(css,/\.audit-token-layer\[hidden\],\.audit-token-window\[hidden\]\{display:none!important;pointer-events:none!important\}/);
  assert.match(css,/\.audit-token-abort\{width:min\(300px,100%\)/);
});
