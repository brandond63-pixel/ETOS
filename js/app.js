(() => {
  'use strict';

  const VERSION = '0.1.3-dev';
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
    returnBoot: $('return-boot'), refreshApp: $('refresh-app'),
    skip: $('skip-transition'), progress: $('transfer-progress'), transferLine: $('transfer-line'),
    versionLabel: $('version-label'), wardenVersion: $('warden-version')
  };

  let state = loadState();
  let holdTimer = null;

  function loadState() {
    try {
      return { activeTerminal: 'command', initialized: false, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
    } catch {
      return { activeTerminal: 'command', initialized: false };
    }
  }

  function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

  function showScreen(name) {
    for (const el of [els.boot, els.terminal, els.transfer]) {
      el.hidden = true;
      el.classList.remove('screen--active');
    }
    els[name].hidden = false;
    els[name].classList.add('screen--active');
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
    state.initialized = true;
    saveState();
    renderTerminal();
    showScreen('terminal');
  }

  function openWarden() {
    cancelHold();
    els.overlay.hidden = false;
    els.pinStep.hidden = false;
    els.controls.hidden = true;
    els.pin.value = '';
    els.pinError.textContent = '';
    if (navigator.vibrate) navigator.vibrate(40);
    setTimeout(() => els.pin.focus(), 50);
  }

  function closeWarden() { els.overlay.hidden = true; }

  function authorize() {
    if (els.pin.value === WARDEN_PIN) {
      els.pinStep.hidden = true;
      els.controls.hidden = false;
      els.select.value = state.activeTerminal;
    } else {
      els.pinError.textContent = 'AUTHORIZATION DENIED';
      els.pin.value = '';
    }
  }

  async function transferTo(key) {
    closeWarden();
    if (els.skip.checked) {
      state.activeTerminal = key;
      state.initialized = true;
      saveState();
      renderTerminal();
      showScreen('terminal');
      return;
    }

    showScreen('transfer');
    els.progress.style.width = '0%';
    const lines = [
      'VERIFYING LOCAL HARDWARE...', 'CLOSING ACTIVE SESSION...',
      'ROUTING ENCRYPTED NODE...', 'MOUNTING TERMINAL PROFILE...',
      'AUTHENTICATING LOCAL CACHE...', 'TERMINAL READY'
    ];
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

    state.activeTerminal = key;
    state.initialized = true;
    saveState();
    renderTerminal();
    showScreen('terminal');
  }

  function returnToBoot() {
    closeWarden();
    state.initialized = false;
    saveState();
    showScreen('boot');
  }

  async function refreshApplication() {
    const original = els.refreshApp.textContent;
    els.refreshApp.disabled = true;
    els.refreshApp.textContent = 'CHECKING...';
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) await registration.update();
      }
      els.refreshApp.textContent = 'RELOADING LATEST BUILD...';
      setTimeout(() => location.reload(), 500);
    } catch {
      els.refreshApp.textContent = 'UPDATE CHECK FAILED';
      setTimeout(() => {
        els.refreshApp.textContent = original;
        els.refreshApp.disabled = false;
      }, 1600);
    }
  }

  function resetSession() {
    if (!confirm('Reset all ETOS session data and return to the boot screen?')) return;
    localStorage.removeItem(STORAGE_KEY);
    state = loadState();
    closeWarden();
    renderTerminal();
    showScreen('boot');
  }

  function beginHold(event) {
    if (event && event.pointerType === 'mouse' && event.button !== 0) return;
    cancelHold();
    holdTimer = window.setTimeout(openWarden, 3000);
  }

  function cancelHold() {
    if (holdTimer !== null) window.clearTimeout(holdTimer);
    holdTimer = null;
  }

  function bindHoldTrigger(trigger) {
    if (!trigger) return;
    trigger.addEventListener('pointerdown', beginHold);
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(name => trigger.addEventListener(name, cancelHold));
    trigger.addEventListener('contextmenu', event => event.preventDefault());
  }

  els.init.addEventListener('click', initialize);
  bindHoldTrigger(els.logo);
  bindHoldTrigger(els.title);
  els.close.addEventListener('click', closeWarden);
  els.pinSubmit.addEventListener('click', authorize);
  els.pin.addEventListener('keydown', event => { if (event.key === 'Enter') authorize(); });
  els.apply.addEventListener('click', () => transferTo(els.select.value));
  els.returnBoot.addEventListener('click', returnToBoot);
  els.refreshApp.addEventListener('click', refreshApplication);
  els.reset.addEventListener('click', resetSession);

  const updateClock = () => {
    els.clock.textContent = new Date().toLocaleTimeString('en-US', { hour12: false });
  };
  updateClock();
  setInterval(updateClock, 1000);

  els.versionLabel.textContent = `ETOS v${VERSION}`;
  els.wardenVersion.textContent = `v${VERSION}`;
  renderTerminal();
  showScreen(state.initialized ? 'terminal' : 'boot');

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('./service-worker.js');
        registration.update();
      } catch (error) {
        console.warn('ETOS service worker unavailable.', error);
      }
    });
  }

  console.info(`ETOS v${VERSION} loaded.`);
})();
