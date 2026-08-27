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
  assert.notEqual(start, -1);
  return source.slice(start, source.indexOf('\n  function ', start + 1));
}
const faultData = source.slice(source.indexOf('  const facilityFaults ='), source.indexOf('  const facilityTargetsMap ='));
const context = vm.createContext({ facilitySelectedTarget: 'garage-door', facilitySystemState: { airlockOuterOpen: false, medbayUnlocked: false, medbayOpen: false, freezerUnlocked: false, freezerOpen: false } });
const api = vm.runInContext(faultData + ['renderFacilityFaultRows', 'renderFacilityDiagnostic', 'updateFacilityDiagnostic'].map(extract).join('\n') + '\n({faults:facilityFaults,renderFacilityFaultRows,renderFacilityDiagnostic,updateFacilityDiagnostic})', context);

test('all seven faults retain their numbers, names, targets, and severity without list descriptions', () => {
  const html = api.renderFacilityFaultRows();
  assert.equal(api.faults.length, 7);
  assert.equal((html.match(/<button /g) || []).length, 7);
  assert.doesNotMatch(html, /<small>|<i>|<h4>/);
  api.faults.forEach((fault, index) => {
    assert.ok(html.includes(`data-facility-target="${fault.target}"`));
    assert.ok(html.includes(`<b>${String(index + 1).padStart(2, '0')}</b>`));
    assert.ok(html.includes(`<strong>${fault.title}</strong>`));
    assert.ok(html.includes(`facility-fault-group--${fault.severity}`));
  });
});
test('each selected fault produces one diagnostic, never simultaneous garage and airlock controls', () => {
  for (const target of [...api.faults.map(f => f.target), 'airlock-control', 'medbay-door', 'freezer-door']) {
    context.facilitySelectedTarget = target;
    const html = api.renderFacilityDiagnostic();
    assert.equal((html.match(/<h3>/g) || []).length, 1, target);
    assert.ok(!(html.includes('data-garage-open') && html.includes('data-airlock-cycle')));
  }
});
test('garage retains actual state values, command hook, feedback area, and service warning', () => {
  context.facilitySelectedTarget = 'garage-door';
  const html = api.renderFacilityDiagnostic();
  for (const text of ['GARAGE DOOR 02', 'CLOSED', 'STALLED', 'ABOVE LIMIT', 'data-garage-open', 'data-garage-result', 'LOCAL SERVICE REQUIRED']) assert.ok(html.includes(text));
  assert.doesNotMatch(html, /EXTERIOR DOOR DIAGNOSTIC/);
});
test('airlock retains the existing open/close controls and all operational states', () => {
  context.facilitySelectedTarget = 'airlock-control';
  for (const open of [false, true]) {
    context.facilitySystemState.airlockOuterOpen = open;
    const html = api.renderFacilityDiagnostic();
    for (const text of ['CYCLING SYSTEM', 'AVAILABLE', 'PRESSURE SEAL', 'NOMINAL', 'DECONTAMINATION', 'STANDBY', 'SEVERE WEATHER', 'data-airlock-cycle', 'data-airlock-result', 'wind-driven rain and airborne contaminants']) assert.ok(html.includes(text));
    assert.ok(html.includes(open ? 'CLOSE EXTERIOR HATCH' : 'YES — BEGIN CYCLE'));
  }
});
test('selection replaces prior detail and resets only the detail scroll position', () => {
  const panel = { innerHTML: 'old detail', scrollTop: 100 };
  const rows = api.faults.map(f => ({ dataset: { facilityTarget: f.target }, classList: { toggle(name, selected) { this.selected = selected; } }, setAttribute(name, value) { this[name] = value; } }));
  const mockRoot = { querySelector: () => panel, querySelectorAll: () => rows };
  context.facilitySelectedTarget = 'garage-door';
  api.updateFacilityDiagnostic(mockRoot);
  assert.equal(panel.scrollTop, 0);
  assert.match(panel.innerHTML, /data-garage-open/);
  assert.equal(rows.filter(r => r['aria-pressed'] === 'true').length, 1);
  context.facilitySelectedTarget = 'airlock-control';
  api.updateFacilityDiagnostic(mockRoot);
  assert.doesNotMatch(panel.innerHTML, /data-garage-open/);
  assert.match(panel.innerHTML, /data-airlock-cycle/);
});
test('layout uses separate scroll areas and normal-flow controls without map or rail changes', () => {
  const patch = css.slice(css.indexOf('/* v0.5.92-dev'));
  assert.match(patch, /min-height:54px/);
  assert.match(patch, /grid-template-columns:minmax\(0,1fr\) clamp\(220px,28%,300px\)/);
  assert.match(patch, /grid-template-rows:min\(210px,40%\) minmax\(0,1fr\)/);
  assert.match(patch, /\.facility-room-info\{display:block/);
  assert.match(patch, /overflow-x:hidden;\s*overflow-y:auto;\s*overscroll-behavior-y:contain/);
  assert.match(patch, /\.facility-room-info>button\{\s*position:static/);
  assert.doesNotMatch(patch, /\.command-nav|\.node-strip|\.audit-token|\.facility-map-transform/);
  assert.equal((css.match(/\{/g) || []).length, (css.match(/\}/g) || []).length);
});
