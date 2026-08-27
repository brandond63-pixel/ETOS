const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css/themes/command.css'), 'utf8');
function extract(name) {
  const start = source.indexOf(`  function ${name}(`);
  assert.notEqual(start, -1, name);
  return source.slice(start, source.indexOf('\n  function ', start + 1));
}
const names = ['renderFacilityMetricCells', 'renderFacilityComparison', 'renderFacilityCondition', 'renderHorizonFacility', 'renderHeronTelemetry'];
const values = { horizon: { reactor: 64.1, life: 41.2, water: 30.3, reserve: 19.4 }, heron: { reactor: 89.1, life: 74.2, water: 85.3, reserve: 70.4 } };
const api = vm.runInNewContext(names.map(extract).join('\n') + `\n({${names.join(',')}})`, { facilityValues: values, renderFacilityOverlay: () => '' });
const conditions = html => [...html.matchAll(/<dt>([^<]+)<\/dt><dd>([^<]+)<\/dd>/g)].map(m => [m[1], m[2]]);

test('comparison preserves four live metrics per site with direct actions and no lower detail frames', () => {
  const html = api.renderFacilityComparison();
  assert.doesNotMatch(html, /facility-comparison-grid|facility-station-card|facility-condition-panel|<dl>|<p>/);
  for (const site of ['horizon', 'heron']) {
    for (const [key, value] of Object.entries(values[site])) {
      assert.ok(html.includes(`data-facility-metric="${site}-${key}">${value.toFixed(1)}%`));
      assert.ok(html.includes(`data-facility-bar="${site}-${key}"`));
    }
    assert.match(html, new RegExp(`data-facility-bar="${site}-reserve"[^]*?<button type="button" data-facility-open="${site}"`));
  }
  assert.match(html, /data-facility-heron-countdown/);
  assert.equal((html.match(/data-facility-open=/g) || []).length, 2);
});
test('Horizon preserves all existing condition values and the explanatory note', () => {
  const html = api.renderHorizonFacility();
  assert.deepEqual(conditions(html), [['HULL INTEGRITY','72%'],['HABITAT BREACHES','MULTIPLE'],['ATMOSPHERE','UNSTABLE'],['INTERIOR PRESSURE','MAINTAINED'],['ENVIRONMENTAL EXPOSURE','LOCALIZED'],['ENVIRONMENTAL PROTECTION','LIMITED']]);
  assert.ok(html.includes('Multiple habitat breaches detected. Environmental sealing has failed in several sections. Interior pressure remains partially stable. Structure provides limited protection from external conditions. Vacuum suits recommended for prolonged occupancy.'));
  assert.doesNotMatch(html, /facility-horizon-brand|ellison-tanaka-logo|BUILDING BETTER FUTURES/);
  assert.equal((html.match(/data-facility-metric=/g) || []).length, 4);
  for (const text of ['HABITAT CONDITION', 'LOCAL PERSONNEL NETWORK', 'FACILITY RECORD BUS']) assert.ok(html.includes(text));
});
test('Horizon cards contain only their titles with unchanged navigation targets', () => {
  const buttons = [...api.renderHorizonFacility().matchAll(/<button type="button" data-facility-nav="([^"]+)">([\s\S]*?)<\/button>/g)];
  assert.deepEqual(buttons.map(m => m[1]), ['personnel', 'map', 'vehicles', 'workorders']);
  assert.deepEqual(buttons.map(m => m[2]), ['<strong>PERSONNEL DIRECTORY</strong>', '<strong>FACILITY SCHEMATICS</strong>', '<strong>VEHICLE INVENTORY &amp; LOG</strong>', '<strong>WORK ORDER ARCHIVE</strong>']);
});
test('Heron conditions remain available with passive restrictions and reactor advisory access', () => {
  const html = api.renderHeronTelemetry();
  assert.deepEqual(conditions(html), [['HULL INTEGRITY','94%'],['HABITAT BREACHES','NONE DETECTED'],['ATMOSPHERE','DEGRADING'],['INTERIOR PRESSURE','NOMINAL'],['LIFE SUPPORT','REDUCED CAPACITY'],['ENVIRONMENTAL PROTECTION','EFFECTIVE']]);
  assert.ok(html.includes('Primary habitat remains structurally intact. Atmospheric processing efficiency continues to decline. Conditions remain habitable for an indeterminate period if critical systems remain operational.'));
  for (const text of ['PASSIVE TELEMETRY ONLY', 'NOT ESTABLISHED', 'data-heron-reactor', 'data-facility-overlay-close', 'data-facility-heron-countdown']) assert.ok(html.includes(text));
  assert.equal((html.match(/<button /g) || []).length, 2);
});
test('Facility CSS retains compact touch targets without changing the sidebar', () => {
  const patch = css.slice(css.indexOf('/* v0.5.91-dev'), css.indexOf('/* v0.5.92-dev'));
  assert.match(patch, /grid-auto-rows:minmax\(56px,auto\);gap:7px/);
  assert.match(patch, /\.facility-horizon-home \.facility-module-grid>button\{\s*min-height:56px/);
  assert.doesNotMatch(patch, /\.command-nav|\.node-strip|\.audit-token|data-command-interlock/);
  assert.equal((css.match(/\{/g) || []).length, (css.match(/\}/g) || []).length);
});
