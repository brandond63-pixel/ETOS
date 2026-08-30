const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'js', 'countdown-state.js'), 'utf8');
const window = {};
vm.runInNewContext(source, { window });
const timer = window.ETOSCountdown;
let passed = 0;

function test(name, fn) {
  fn();
  passed += 1;
  process.stdout.write(`PASS ${name}\n`);
}

const fresh = now => timer.normalize({}, now);

test('default duration is 04:00:00', () => {
  const state = fresh(1000);
  assert.equal(state.configuredMs, 14_400_000);
  assert.equal(timer.format(timer.displaySeconds(state, 1000)), '04:00:00');
});

test('start uses an absolute target timestamp', () => {
  const state = fresh(1000);
  timer.start(state, 1000);
  assert.equal(state.targetTimestamp, 14_401_000);
  assert.equal(timer.format(timer.displaySeconds(state, 3_601_000)), '03:00:00');
});

test('elapsed wall time catches up after backgrounding or navigation', () => {
  const state = fresh(50_000);
  timer.start(state, 50_000);
  assert.equal(timer.format(timer.displaySeconds(state, 50_000 + 12_345_000)), '00:34:15');
});

test('running state survives serialization and refresh', () => {
  const state = fresh(0);
  timer.start(state, 20_000);
  const restored = timer.normalize(JSON.parse(JSON.stringify(state)), 3_620_000);
  assert.equal(restored.status, 'running');
  assert.equal(timer.format(timer.displaySeconds(restored, 3_620_000)), '03:00:00');
});

test('pause freezes exact remaining milliseconds and survives refresh', () => {
  const state = fresh(0);
  timer.start(state, 10_000);
  timer.pause(state, 1_244_567);
  const restored = timer.normalize(JSON.parse(JSON.stringify(state)), 9_999_999);
  assert.equal(restored.status, 'paused');
  assert.equal(restored.pausedRemainingMs, 13_165_433);
  assert.equal(timer.displaySeconds(restored, 99_999_999), 13_166);
});

test('resume creates a new absolute target', () => {
  const state = fresh(0);
  timer.start(state, 0);
  timer.pause(state, 1_234);
  timer.resume(state, 9_000_000);
  assert.equal(state.targetTimestamp, 9_000_000 + 14_398_766);
  assert.equal(state.status, 'running');
});

for (const minutes of [1, -1, 5, -5]) {
  test(`${minutes > 0 ? '+' : ''}${minutes} minute adjustment works while running`, () => {
    const state = fresh(0);
    timer.start(state, 1000);
    timer.adjust(state, minutes * 60_000, 61_000);
    assert.equal(timer.remainingMs(state, 61_000), 14_340_000 + minutes * 60_000);
  });
  test(`${minutes > 0 ? '+' : ''}${minutes} minute adjustment works while paused`, () => {
    const state = fresh(0);
    timer.start(state, 0);
    timer.pause(state, 60_000);
    timer.adjust(state, minutes * 60_000, 9_000_000);
    assert.equal(timer.remainingMs(state, 99_000_000), 14_340_000 + minutes * 60_000);
  });
}

test('adjustment cannot create negative remaining time', () => {
  const state = timer.normalize({ configuredMs: 30_000, pausedRemainingMs: 30_000, status: 'paused' }, 0);
  timer.adjust(state, -300_000, 0);
  assert.equal(timer.remainingMs(state, 0), 0);
  assert.equal(state.status, 'expired');
});

test('expired running state restores cleanly at zero', () => {
  const state = timer.normalize({ configuredMs: 10_000, pausedRemainingMs: 10_000, status: 'running', targetTimestamp: 5_000 }, 5_000);
  assert.equal(state.status, 'expired');
  assert.equal(timer.format(timer.displaySeconds(state, 999_999)), '00:00:00');
});

test('alert thresholds change at exact required seconds', () => {
  const check = (seconds, level, text) => assert.equal(JSON.stringify(timer.alertFor(seconds)), JSON.stringify({ level, text }));
  check(3601, 'nominal', 'ARGOZA SURFACE RECOVERY WINDOW // NOMINAL');
  check(3600, 'advisory', 'WX ADVISORY // STORM FRONT APPROACHING');
  check(1800, 'degraded', 'RECOVERY WINDOW DEGRADED');
  check(600, 'critical', 'EXTRACTION VIABILITY CRITICAL');
  check(0, 'expired', 'SURFACE RECOVERY UNAVAILABLE // WEATHER LIMIT EXCEEDED');
});

test('dedicated display contains no player-facing controls', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const display = html.match(/<section id="countdown-screen"[\s\S]*?<\/section>/)?.[0] || '';
  assert.ok(display);
  assert.equal(/<(button|input|select|a)\b/i.test(display), false);
  assert.match(display, /ETV ARGOZA \/\/ SURFACE OPERATIONS/);
  assert.match(display, /assets\/img\/ellison-tanaka-logo\.svg/);
  assert.match(display, /draggable="false"/);
});

test('integration uses shared state, logo hold Warden access, and Warden-only close', () => {
  const app = fs.readFileSync(path.join(root, 'js', 'app.js'), 'utf8');
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'css', 'app.css'), 'utf8');
  assert.match(app, /countdown=window\.ETOSCountdown\.normalize\(saved\.countdown/);
  assert.match(app, /holdTimer=setTimeout\(\(\)=>\{cancelCountdownLogoHold\(\);openWarden\(\);\},3000\)/);
  assert.match(app, /countdownClose\.hidden=!state\.countdownDisplayOpen/);
  assert.match(app, /countdownClose\.addEventListener\('click',exitCountdownDisplay\)/);
  assert.doesNotMatch(app, /countdownLogo\.addEventListener\('click'/);
  assert.match(app, /state\.countdownDisplayOpen=true;saveState\(\)/);
  assert.match(app, /confirm\('Reset the surface extraction countdown to its configured duration\?'\)/);
  assert.match(html, /id="close-countdown-display"[^>]*hidden>CLOSE TIMER DISPLAY/);
  assert.match(css, /font-size:clamp\(72px,min\(16\.5vw,42vh\),260px\)/);
  assert.match(css, /height:min\(62dvh,100%\)/);
  const closeFunction = app.match(/function exitCountdownDisplay\(\)\{([^}]|}\s*else\s*[^}]+})+}/)?.[0] || '';
  assert.ok(closeFunction);
  assert.doesNotMatch(closeFunction, /pauseCountdown|resetCountdown|stopCountdownTicker|targetTimestamp|pausedRemainingMs/);
});

process.stdout.write(`\n${passed} countdown checks passed.\n`);
