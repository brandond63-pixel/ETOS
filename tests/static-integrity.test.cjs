const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const productionSources = [
  'index.html', 'manifest.webmanifest', 'service-worker.js',
  'css/app.css', 'css/themes/command.css', 'css/themes/medical.css',
  'css/themes/edem.css', 'css/themes/argoza.css',
  'js/app.js', 'js/audio.js', 'js/argoza-recovery.js'
];

test('every literal production asset reference resolves inside the repository', () => {
  const references = new Set();
  for (const file of productionSources) {
    const source = read(file);
    for (const match of source.matchAll(/(?:\.\.\/)*assets\/[A-Za-z0-9_./-]+\.(?:png|jpe?g|svg|gif|webp|mp3|wav|ogg|json)/gi)) {
      references.add(match[0].replace(/^(?:\.\.\/)+/, ''));
    }
  }
  for (const vial of ['vial1.png','vial2.png','vial3.png']) references.add(`assets/img/${vial}`);
  assert.ok(references.size > 35, `unexpectedly small asset inventory: ${references.size}`);
  for (const reference of references) assert.ok(fs.existsSync(path.join(root, reference)), `missing runtime asset: ${reference}`);
});

test('entry-point styles, scripts, manifest, icons, and service worker resolve', () => {
  const html = read('index.html');
  for (const match of html.matchAll(/(?:href|src)="([^"?#]+)(?:[?#][^"]*)?"/g)) {
    const reference = match[1];
    if (/^(?:https?:|data:|#)/.test(reference)) continue;
    assert.ok(fs.existsSync(path.join(root, reference)), `missing entry-point resource: ${reference}`);
  }
  const manifest = JSON.parse(read('manifest.webmanifest'));
  for (const icon of manifest.icons || []) assert.ok(fs.existsSync(path.join(root, icon.src)), `missing PWA icon: ${icon.src}`);
  assert.ok(fs.existsSync(path.join(root, 'service-worker.js')));
});

test('standalone cryo entry point remains self-contained', () => {
  const html = read('cryo/index.html');
  for (const match of html.matchAll(/(?:href|src)="([^"?#]+)(?:[?#][^"]*)?"/g)) {
    const reference = match[1];
    if (/^(?:https?:|data:|#)/.test(reference)) continue;
    assert.ok(fs.existsSync(path.join(root, 'cryo', reference)), `missing cryo resource: ${reference}`);
  }
});

test('removed superseded assets cannot be referenced again accidentally', () => {
  const all = productionSources.map(read).join('\n');
  for (const name of [
    'facility-emergency-alarm.wav', 'sanitization-warning-pulse.wav',
    'ellison-tanaka-logo.png', 'weather-radar-reference.png',
    'weather-site-blink.png', 'weather-storm-overlay.png'
  ]) assert.ok(!all.includes(name), `obsolete reference remains: ${name}`);
});
