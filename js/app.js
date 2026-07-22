(() => {
  'use strict';

  const VERSION = '0.1.0';
  const WARDEN_PIN = '8722';
  const TRANSFER_MS = 8000;
  const STORAGE_KEY = 'etos.session.v1';

  const terminals = {
    command: { title: 'HORIZON BASE // COMMAND TERMINAL', installation: 'HORIZON BASE', selected: 'COMMAND' },
    medical: { title: 'HORIZON BASE // MEDICAL TERMINAL', installation: 'HORIZON BASE', selected: 'MEDICAL' },
    edem: { title: 'DR. EDEM // PERSONAL TERMINAL', installation: 'HORIZON BASE', selected: 'DR. EDEM' },
    argoza: { title: 'ETV ARGOZA // SHIPBOARD TERMINAL', installation: 'ETV ARGOZA', selected: 'ARGOZA' }
  };

  const $ = (id) => document.getElementById(id);
  const els = {
    boot: $('boot-screen'), terminal: $('terminal-screen'), transfer: $('transfer-screen'),
    init: $('initialize-button'), logo: $('brand-logo'), title: $('terminal-title'),
    content: $('terminal-content'), clock: $('clock'), overlay: $('warden-overlay'),
    close: $('warden-close'), pin: $('warden-pin'), pinSubmit: $('pin-submit'),
    pinError: $('pin-error'), pinStep: $('pin-step'), controls: $('warden-controls'),
    select: $('terminal-select'), apply: $('apply-terminal'), reset: $('reset-session'),
    skip: $('skip-transition'), progress: $('transfer-progress'), transferLine: $('transfer-line')
  };

  let state = loadState();
  let holdTimer = null;

  function loadState() {
    try {
      return { activeTerminal: 'command', initialized: false, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
    } catch { return { activeTerminal: 'command', initialized: false }; }
  }

  function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

  function showScreen(name) {
    for (const el of [els.boot, els.terminal, els.transfer]) { el.hidden = true; el.classList.remove('screen--active'); }
    els[name].hidden = false; els[name].classList.add('screen--active');
  }

  function renderTerminal() {
    const terminal = terminals[state.activeTerminal] || terminals.command;
    els.title.textContent = terminal.title;
    els.select.value = state.activeTerminal;
    els.content.innerHTML = [
      '<p>&gt; ETOS CORE ONLINE</p>',
      '<p>&gt; OFFLINE DATA CACHE VERIFIED</p>',
      `<p>&gt; ACTIVE INSTALLATION: ${terminal.installation}</p>`,
      `<p>&gt; SELECTED TERMINAL: ${terminal.selected}</p>`,
      '<p class="warning">&gt; MODULE CONTENT NOT YET INSTALLED</p>'
    ].join('');
  }

  function initialize() {
    state.initialized = true; saveState(); renderTerminal(); showScreen('terminal');
  }

  function openWarden() {
    els.overlay.hidden = false; els.pinStep.hidden = false; els.controls.hidden = true;
    els.pin.value = ''; els.pinError.textContent = ''; setTimeout(() => els.pin.focus(), 50);
  }

  function authorize() {
    if (els.pin.value === WARDEN_PIN) { els.pinStep.hidden = true; els.controls.hidden = false; els.select.value = state.activeTerminal; }
    else { els.pinError.textContent = 'AUTHORIZATION DENIED'; els.pin.value = ''; }
  }

  async function transferTo(key) {
    els.overlay.hidden = true;
    if (els.skip.checked) { state.activeTerminal = key; saveState(); renderTerminal(); showScreen('terminal'); return; }
    showScreen('transfer'); els.progress.style.width = '0%';
    const lines = ['VERIFYING LOCAL HARDWARE...', 'CLOSING ACTIVE SESSION...', 'ROUTING ENCRYPTED NODE...', 'MOUNTING TERMINAL PROFILE...', 'AUTHENTICATING LOCAL CACHE...', 'TERMINAL READY'];
    const start = performance.now();
    await new Promise(resolve => {
      const tick = (now) => {
        const p = Math.min(1, (now - start) / TRANSFER_MS);
        els.progress.style.width = `${Math.round(p * 100)}%`;
        els.transferLine.textContent = lines[Math.min(lines.length - 1, Math.floor(p * lines.length))];
        if (p < 1) requestAnimationFrame(tick); else resolve();
      };
      requestAnimationFrame(tick);
    });
    state.activeTerminal = key; saveState(); renderTerminal(); showScreen('terminal');
  }

  function beginHold() { clearTimeout(holdTimer); holdTimer = setTimeout(openWarden, 3000); }
  function cancelHold() { clearTimeout(holdTimer); holdTimer = null; }

  els.init.addEventListener('click', initialize);
  ['pointerdown', 'touchstart'].forEach(ev => els.logo.addEventListener(ev, beginHold, { passive: true }));
  ['pointerup', 'pointercancel', 'pointerleave', 'touchend', 'touchcancel'].forEach(ev => els.logo.addEventListener(ev, cancelHold, { passive: true }));
  els.close.addEventListener('click', () => { els.overlay.hidden = true; });
  els.pinSubmit.addEventListener('click', authorize);
  els.pin.addEventListener('keydown', e => { if (e.key === 'Enter') authorize(); });
  els.apply.addEventListener('click', () => transferTo(els.select.value));
  els.reset.addEventListener('click', () => {
    if (confirm('Reset ETOS session state?')) { localStorage.removeItem(STORAGE_KEY); state = loadState(); location.reload(); }
  });

  setInterval(() => { els.clock.textContent = new Date().toLocaleTimeString('en-US', { hour12: false }); }, 1000);
  renderTerminal();
  if (state.initialized) showScreen('terminal');

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(() => {}));
  }

  console.info(`ETOS v${VERSION} loaded.`);
})();
