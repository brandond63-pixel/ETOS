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
const records = source.slice(source.indexOf('  const facilityVehicleLogs = ['), source.indexOf('  function renderFacilityMetricCells('));
const context = vm.createContext({ facilitySelectedVehicle: '', facilitySelectedWorkOrder: '' });
const api = vm.runInContext(records + ['formatFacilityRecordDate', 'renderVehicleLog', 'renderWorkOrders'].map(extract).join('\n') + '\n({facilityVehicleLogs,facilityWorkOrders,formatFacilityRecordDate,renderVehicleLog,renderWorkOrders})', context);
const before = JSON.stringify([api.facilityWorkOrders, api.facilityVehicleLogs]);

test('compact date formatting changes only the displayed year', () => {
  assert.equal(api.formatFacilityRecordDate('02/16/2122'), '02/16/22');
  assert.equal(api.formatFacilityRecordDate('12/31/2121'), '12/31/21');
  assert.equal(api.formatFacilityRecordDate('02/16/22'), '02/16/22');
  assert.equal(api.formatFacilityRecordDate('UNKNOWN'), 'UNKNOWN');
});

for (const [name, items, render, selected, attribute] of [
  ['Work Orders', api.facilityWorkOrders, api.renderWorkOrders, 'facilitySelectedWorkOrder', 'data-work-order'],
  ['Vehicle Dispatch', api.facilityVehicleLogs, api.renderVehicleLog, 'facilitySelectedVehicle', 'data-vehicle-record']
]) {
  test(`${name} preserves every full title, status, selection hook, and retained date`, () => {
    for (const item of items) {
      context[selected] = item.id;
      const html = render();
      const list = html.slice(html.indexOf('<section class="facility-record-index">'), html.indexOf('</section>', html.indexOf('<section class="facility-record-index">')));
      assert.equal((list.match(/<button /g) || []).length, items.length);
      for (const entry of items) {
        assert.ok(list.includes(`<span>${api.formatFacilityRecordDate(entry.date)}</span><strong>${entry.title}</strong><em>${entry.status}</em>`));
        assert.match(entry.date, /^\d{2}\/\d{2}\/2122$/);
      }
      assert.ok(list.includes(`${attribute}="${item.id}" class="is-selected"`));
      assert.equal((list.match(/class="is-selected"/g) || []).length, 1);
      const detail = html.slice(html.indexOf('<article class="facility-record-detail'));
      assert.ok(detail.includes(`<h3>${item.title}</h3><strong>${item.status}</strong>`));
      for (const [key, value] of item.fields || []) assert.ok(detail.includes(`<dt>${key}</dt><dd>${value}</dd>`));
      if (item.body) assert.ok(detail.includes(`<p>${item.body}</p>`));
      for (const line of item.resolution || []) assert.ok(detail.includes(`<span>${line}</span>`));
      if (item.archived) assert.ok(detail.includes('removed under the facility maintenance retention policy'));
    }
    assert.equal(JSON.stringify([api.facilityWorkOrders, api.facilityVehicleLogs]), before);
  });
}

test('compact CSS is confined to these lists and preserves full text and vertical scrolling', () => {
  const patch = css.slice(css.indexOf('/* v0.5.93-dev'), css.indexOf('/* v0.5.94-dev'));
  assert.match(patch, /grid-template-columns:auto minmax\(0,1fr\) auto/);
  assert.match(patch, /min-height:44px/);
  assert.match(patch, /font-size:12px!important/);
  assert.match(patch, /overflow-y:auto/);
  assert.match(patch, /overflow-x:hidden/);
  assert.match(patch, /white-space:nowrap/);
  assert.match(patch, /text-align:right/);
  assert.doesNotMatch(patch, /line-clamp|text-overflow|\.facility-record-detail|\.command-nav|\.weather-/);
});
