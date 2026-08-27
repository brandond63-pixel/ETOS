const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css/themes/command.css'), 'utf8');
const weatherRender = source.match(/weather:\s*\{\s*label: 'PLANETARY WEATHER SURVEILLANCE', clearance: 'GENERAL', render: ([\s\S]*?)\n    \},\s*directive:/)[1].trim();
const weatherCode = source.slice(source.indexOf("  const WEATHER_LAYOUT_KEY ="), source.indexOf('  const OVERVIEW_FONT_KEY ='));
function setup(saved, failWrites = false) {
  const storage = new Map(saved === undefined ? [] : [['etos.weather.map-layout.v5', saved]]);
  const context = vm.createContext({
    localStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => { if (failWrites) throw Error('Storage blocked'); storage.set(key, value); },
      removeItem: key => storage.delete(key),
    },
  });
  const api = vm.runInContext(weatherCode + '\n({loadWeatherLayout, saveWeatherLayout, applyWeatherLayout, initWeatherSandbox, weatherLayoutDefaults})', context);
  return { ...api, storage };
}
const render = show => vm.runInNewContext(`(${weatherRender})()`, { loadDevPrefs: () => ({ show }) });
function fakeRoot(dev = false) {
  const element = extra => ({ events: {}, addEventListener(name, handler) { this.events[name] = handler; }, ...extra });
  const panel = element({ hidden: true });
  const toggle = element({});
  const reset = element({});
  const output = {};
  const duration = element({ type: 'range', dataset: { layout: 'stormDuration' } });
  const selectors = dev ? {
    '[data-weather-sandbox]': panel, '[data-storm-reset]': reset,
    '[data-layout="stormDuration"]': duration, '[data-out="stormDuration"]': output,
  } : {};
  const properties = {};
  const root = {
    dataset: {}, style: { setProperty: (name, value) => { properties[name] = value; } },
    closest: () => null,
    querySelector: selector => selectors[selector] ?? null,
    querySelectorAll: selector => dev ? ({ '[data-layout]': [duration], '[data-sandbox-toggle]': [toggle] }[selector] ?? []) : [],
  };
  return { root, properties, panel, toggle, reset, duration, output };
}

test('player render omits the entire weather developer UI without a placeholder', () => {
  const html = render(false);
  assert.doesNotMatch(html, /WEATHER DEV TOOLS|data-sandbox|data-weather-sandbox|weather-topbar--dev/);
  assert.match(html, /<header class="weather-topbar">/);
});
test('global developer preference adds the header button and sandbox', () => {
  const html = render(true);
  const header = html.match(/<header class="weather-topbar[\s\S]*?<\/header>/)[0];
  assert.match(header, /weather-topbar--dev/);
  assert.match(header, /WEATHER DEV TOOLS/);
  assert.match(html, /data-weather-sandbox hidden/);
  assert.match(html, /RESET ROTATION TO 500s/);
});
test('impact probability is removed while IMMINENT and requested panels remain', () => {
  const html = render(false);
  assert.doesNotMatch(html, /IMPACT PROBABILITY|93%|<u\b/);
  for (const text of ['weather-imminent', 'IMMINENT', 'STORM METRICS', 'REGIONAL OUTLOOK', 'LATEST OBSERVATIONS']) assert.ok(html.includes(text));
  assert.match(html, /CATEGORY IV<\/span><span>SUPERCELL/);
  assert.match(css, /\.weather-imminent\{animation:weatherImminentPulse 1\.3s ease-in-out infinite\}/);
});
test('map markup is identical with developer tools off and on', () => {
  const map = html => html.match(/<main class="weather-radar-panel">[\s\S]*?<\/main>/)[0];
  assert.equal(map(render(false)), map(render(true)));
});
test('new weather settings use a linear 500-second full rotation', () => {
  const settings = setup().loadWeatherLayout();
  assert.equal(settings.stormDuration, 500);
  assert.equal(settings.animateStorm, true);
  assert.equal(settings.stormReverse, false);
  assert.match(css, /animation:weatherStormRotate var\(--storm-duration,500s\) linear infinite!important/);
  assert.match(css, /transform-origin:31% 48%!important/);
  assert.match(css, /rotate\(calc\(var\(--storm-rotation,0deg\) \+ 360deg\)\)/);
});
test('legacy saved timing migrates without changing any other saved settings', () => {
  const old = { ...setup().weatherLayoutDefaults, stormDuration: 240, horizonX: 47.8, mapZoom: 112, stormReverse: true, stormOpacity: 73 };
  delete old.stormTimingVersion;
  const api = setup(JSON.stringify(old));
  const updated = api.loadWeatherLayout();
  assert.equal(updated.stormDuration, 500);
  for (const [key, value] of Object.entries(old)) if (key !== 'stormDuration') assert.equal(updated[key], value, key);
  assert.equal(JSON.parse(api.storage.get('etos.weather.map-layout.v5')).stormTimingVersion, 1);
});
test('subsequent developer duration changes survive reload', () => {
  const api = setup();
  const settings = api.loadWeatherLayout();
  settings.stormDuration = 550;
  api.saveWeatherLayout(settings);
  assert.equal(api.loadWeatherLayout().stormDuration, 550);
});
test('unavailable storage preserves migrated map geometry in memory', () => {
  const api = setup(JSON.stringify({ stormDuration: 240, horizonX: 49.2 }), true);
  assert.equal(api.loadWeatherLayout().stormDuration, 500);
  assert.equal(api.loadWeatherLayout().horizonX, 49.2);
  assert.equal(setup('{malformed').loadWeatherLayout().stormDuration, 500);
});
test('hidden developer UI still applies the saved player map settings', () => {
  const api = setup();
  const mock = fakeRoot(false);
  api.initWeatherSandbox(mock.root);
  assert.equal(mock.properties['--storm-duration'], '500s');
  assert.equal(mock.properties['--storm-scale'], .89);
  assert.equal(mock.properties['--storm-opacity'], .85);
  assert.equal(mock.root.dataset.animateStorm, 'true');
});
test('developer sandbox opens, closes, adjusts duration, and resets to 500 seconds', () => {
  const api = setup();
  const mock = fakeRoot(true);
  api.initWeatherSandbox(mock.root);
  mock.toggle.events.click();
  assert.equal(mock.panel.hidden, false);
  mock.toggle.events.click();
  assert.equal(mock.panel.hidden, true);
  mock.duration.value = '550';
  mock.duration.events.input();
  assert.equal(mock.properties['--storm-duration'], '550s');
  mock.reset.events.click();
  assert.equal(mock.properties['--storm-duration'], '500s');
  assert.equal(mock.duration.value, 500);
  assert.equal(mock.output.value, '500s');
  assert.equal(api.loadWeatherLayout().stormDuration, 500);
});
test('shared telemetry grid keeps compact values and time units together', () => {
  const patch = css.slice(css.indexOf('/* v0.5.89-dev'));
  assert.match(patch, /:is\(\.telemetry-panel,\.outlook-panel,\.latest-observations-panel\)>div,[\s\S]*?\.weather-date>span\{\s*display:grid;/);
  assert.match(patch, /grid-template-columns:minmax\(0,1fr\) max-content/);
  assert.match(patch, /white-space:nowrap;\s*text-align:right;/);
  assert.match(patch, /\.weather-topbar>\.sandbox-toggle\{\s*position:static;/);
  assert.doesNotMatch(patch, /\.weather-grid\s*\{|\.weather-map|\.radar-map\s*\{/);
  assert.equal((css.match(/\{/g) ?? []).length, (css.match(/\}/g) ?? []).length);
});
test('Storm Metrics removes only Pressure and retains the other eight rows in order', () => {
  for (const show of [false, true]) {
    const panel = render(show).match(/<section class="weather-panel telemetry-panel">([\s\S]*?)<\/section>/)[1];
    const labels = [...panel.matchAll(/<div><span>([^<]+)<\/span>/g)].map(match => match[1]);
    assert.deepEqual(labels, ['SURFACE WINDS', 'PEAK GUSTS', 'STORM BEARING', 'FORWARD VELOCITY', 'HUMIDITY', 'VISIBILITY', 'TEMPERATURE', 'ELECTRICAL ACTIVITY']);
    assert.doesNotMatch(panel, /PRESSURE|data-telemetry="pressure"/);
  }
});
test('weather title uses equal side tracks with unchanged header height and typography', () => {
  const patch = css.slice(css.indexOf('/* v0.5.89-dev'));
  assert.match(patch, /grid-template-columns:minmax\(0,1fr\) auto minmax\(0,1fr\)!important/);
  assert.match(patch, /grid-template-rows:58px/);
  assert.match(patch, /\.weather-topbar>\.weather-title\{grid-column:2;justify-self:center\}/);
  assert.doesNotMatch(patch, /\.weather-title[^}]*font-size:/);
});
