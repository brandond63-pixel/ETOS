(() => {
  'use strict';

  // CONFIGURATION: adjust this single ISO-8601 value to change crew revival.
  const REVIVAL_TARGET_DATETIME = '2026-08-29T20:00:00-07:00';

  const SPEED_MULTIPLIER = new URLSearchParams(location.search).get('test') === '1' ? 0.025 : 1;
  const output = document.querySelector('#output');
  const terminal = document.querySelector('#terminal');
  const initialize = document.querySelector('#initialize');
  const startButton = document.querySelector('#startButton');
  const restartButton = document.querySelector('#restartButton');
  const muteButton = document.querySelector('#muteButton');
  const fullscreenButton = document.querySelector('#fullscreenButton');
  const footerState = document.querySelector('#footerState');
  const shipClock = document.querySelector('#shipClock');

  let runId = 0;
  let muted = false;
  let audioContext;
  let masterGain;
  let ambienceGain;
  let ambienceNodes = [];
  let countdownTimer;

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms * SPEED_MULTIPLIER));
  const active = (id) => id === runId;

  function initializeAudio() {
    if (audioContext) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    audioContext = new AudioContext();
    masterGain = audioContext.createGain();
    masterGain.gain.value = muted ? 0 : .56;
    masterGain.connect(audioContext.destination);
  }

  function tone(frequency = 820, duration = .045, volume = .018, type = 'square', delay = 0) {
    if (!audioContext || muted) return;
    const start = audioContext.currentTime + delay;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + .005);
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    oscillator.connect(gain).connect(masterGain);
    oscillator.start(start);
    oscillator.stop(start + duration + .03);
  }

  function noiseBurst(duration = .08, volume = .018, cutoff = 1600) {
    if (!audioContext || muted) return;
    const length = Math.floor(audioContext.sampleRate * duration);
    const buffer = audioContext.createBuffer(1, length, audioContext.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) channel[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const source = audioContext.createBufferSource();
    const filter = audioContext.createBiquadFilter();
    const gain = audioContext.createGain();
    filter.type = 'lowpass';
    filter.frequency.value = cutoff;
    gain.gain.value = volume;
    source.buffer = buffer;
    source.connect(filter).connect(gain).connect(masterGain);
    source.start();
  }

  function relay(volume = .075) {
    if (!audioContext || muted) return;
    const start = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(94, start);
    oscillator.frequency.exponentialRampToValueAtTime(35, start + .27);
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(.0001, start + .31);
    oscillator.connect(gain).connect(masterGain);
    oscillator.start(start);
    oscillator.stop(start + .33);
    noiseBurst(.16, .014, 620);
  }

  function startAmbience() {
    stopAmbience();
    if (!audioContext) return;
    ambienceGain = audioContext.createGain();
    ambienceGain.gain.value = .75;
    ambienceGain.connect(masterGain);

    const hum = audioContext.createOscillator();
    const humGain = audioContext.createGain();
    hum.type = 'sine';
    hum.frequency.value = 43;
    humGain.gain.value = .026;
    hum.connect(humGain).connect(ambienceGain);

    const machinery = audioContext.createOscillator();
    const machineryGain = audioContext.createGain();
    machinery.type = 'triangle';
    machinery.frequency.value = 117;
    machineryGain.gain.value = .0045;
    machinery.connect(machineryGain).connect(ambienceGain);

    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();
    lfo.frequency.value = .16;
    lfoGain.gain.value = .004;
    lfo.connect(lfoGain).connect(humGain.gain);

    [hum, machinery, lfo].forEach((node) => node.start());
    ambienceNodes = [hum, machinery, lfo];
  }

  function stopAmbience() {
    ambienceNodes.forEach((node) => { try { node.stop(); } catch (_) {} });
    ambienceNodes = [];
  }

  function setAmbience(level, seconds = .4) {
    if (!audioContext || !ambienceGain) return;
    ambienceGain.gain.cancelScheduledValues(audioContext.currentTime);
    ambienceGain.gain.linearRampToValueAtTime(level, audioContext.currentTime + seconds);
  }

  function clearOutput() {
    output.replaceChildren();
  }

  function createLine(className = '') {
    const line = document.createElement('div');
    line.className = `line ${className}`.trim();
    output.append(line);
    return line;
  }

  function addCursor(line) {
    output.querySelectorAll('.cursor').forEach((cursor) => cursor.remove());
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    cursor.setAttribute('aria-hidden', 'true');
    line.append(cursor);
    return cursor;
  }

  async function typeLine(text, options = {}, id) {
    const { speed = 24, before = 0, after = 180, className = '', ticks = true, holdCursor = false } = options;
    await sleep(before);
    if (!active(id)) return null;
    const line = createLine(className);
    const cursor = addCursor(line);
    const textNode = document.createTextNode('');
    line.insertBefore(textNode, cursor);
    for (let index = 0; index < text.length; index += 1) {
      if (!active(id)) return null;
      textNode.data += text[index];
      if (ticks && text[index] !== ' ' && index % 2 === 0) tone(760 + Math.random() * 110, .018, .008, 'square');
      await sleep(speed * (.76 + Math.random() * .42));
    }
    if (!holdCursor) cursor.remove();
    await sleep(after);
    return line;
  }

  async function blank(id, delay = 80) {
    if (!active(id)) return;
    createLine('blank');
    await sleep(delay);
  }

  async function databaseLine(label, value, options = {}, id) {
    const { className = '', labelSpeed = 18, pause = 340, valueSpeed = 7, after = 170, relaySound = false } = options;
    const line = createLine(className);
    const labelNode = document.createTextNode('');
    line.append(labelNode);
    const cursor = addCursor(line);
    for (const character of label) {
      if (!active(id)) return null;
      labelNode.data += character;
      if (character !== ' ' && labelNode.data.length % 2 === 0) tone(750 + Math.random() * 100, .018, .007, 'square');
      await sleep(labelSpeed * (.8 + Math.random() * .35));
    }
    await sleep(pause);
    const valueNode = document.createTextNode('');
    line.insertBefore(valueNode, cursor);
    for (const character of value) {
      if (!active(id)) return null;
      valueNode.data += character;
      if (character !== ' ' && valueNode.data.length % 3 === 0) tone(920 + Math.random() * 80, .016, .007, 'square');
      await sleep(valueSpeed);
    }
    cursor.remove();
    if (relaySound) relay(.09);
    await sleep(after);
    return line;
  }

  function glitch() {
    terminal.classList.remove('glitching');
    void terminal.offsetWidth;
    terminal.classList.add('glitching');
    noiseBurst(.07, .027, 2200);
    setTimeout(() => terminal.classList.remove('glitching'), 230);
  }

  function flash() {
    terminal.classList.remove('flash');
    void terminal.offsetWidth;
    terminal.classList.add('flash');
  }

  async function renderPersonnel(person, index, id) {
    const primary = index < 4;
    await typeLine(`${String(index + 1).padStart(2, '0')} / ${person.display}`, { speed: primary ? 19 : 10, className: 'person-name', after: primary ? 150 : 55 }, id);
    await typeLine(person.role, { speed: primary ? 13 : 7, className: 'person-role', after: primary ? 130 : 45 }, id);
    await databaseLine(person.synthetic ? 'SYNTHETIC CORE ............. ' : 'CRYOGENIC CHAMBER .......... ', person.synthetic ? 'SUSPENDED' : 'STABLE', { labelSpeed: primary ? 9 : 5, pause: primary ? 170 : 75, valueSpeed: 5, after: primary ? 90 : 35 }, id);
    await databaseLine('MISSION STATUS ............. ', 'REQUIRED', { labelSpeed: primary ? 8 : 4, pause: primary ? 120 : 50, valueSpeed: 5, after: primary ? 310 : 90 }, id);
  }

  function countdownParts() {
    const target = new Date(REVIVAL_TARGET_DATETIME).getTime();
    const remaining = Math.max(0, target - Date.now());
    const days = Math.floor(remaining / 86400000);
    const hours = Math.floor((remaining % 86400000) / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return { days, hours, minutes, seconds };
  }

  function renderCountdown(container) {
    const { days, hours, minutes, seconds } = countdownParts();
    const fields = [`${days} DAYS`, `${String(hours).padStart(2, '0')} HOURS`, `${String(minutes).padStart(2, '0')} MINUTES`];
    if (days < 1) fields.push(`${String(seconds).padStart(2, '0')} SECONDS`);
    container.innerHTML = fields.map((field, index) => `${index ? '<span class="count-separator">:</span>' : ''}<span class="count-field">${field}</span>`).join('');
    container.dataset.updatedAt = String(Date.now());
  }

  async function showCountdown(id) {
    const block = document.createElement('div');
    block.className = 'countdown-block';
    const label = document.createElement('div');
    label.className = 'countdown-label';
    const value = document.createElement('div');
    value.className = 'countdown-value';
    block.append(label, value);
    output.append(block);

    const labelLine = document.createElement('span');
    label.append(labelLine);
    const cursor = addCursor(label);
    for (const character of 'TIME TO CREW REVIVAL') {
      if (!active(id)) return;
      labelLine.textContent += character;
      if (character !== ' ') tone(800 + Math.random() * 80, .018, .008, 'square');
      await sleep(28);
    }
    await sleep(420);
    cursor.remove();

    const parts = countdownParts();
    const chunks = [`${parts.days} DAYS`, `${String(parts.hours).padStart(2, '0')} HOURS`, `${String(parts.minutes).padStart(2, '0')} MINUTES`];
    for (let index = 0; index < chunks.length; index += 1) {
      if (!active(id)) return;
      if (index) value.insertAdjacentHTML('beforeend', '<span class="count-separator">:</span>');
      const field = document.createElement('span');
      field.className = 'count-field';
      field.textContent = chunks[index];
      value.append(field);
      tone(920 + index * 90, .055, .018, 'sine');
      await sleep(100);
    }
    tone(680, .12, .03, 'sine');
    tone(1020, .16, .022, 'sine', .09);
    clearInterval(countdownTimer);
    countdownTimer = setInterval(() => renderCountdown(value), 1000);
  }

  async function runSequence() {
    const id = ++runId;
    clearInterval(countdownTimer);
    clearOutput();
    terminal.classList.remove('blackout', 'is-dormant');
    footerState.textContent = 'AUTONOMOUS STANDBY';
    startAmbience();

    await sleep(1700);
    await typeLine('ETV ARGOZA', { speed: 34, className: 'accent', after: 260 }, id);
    await typeLine('AUTONOMOUS NAVIGATION ACTIVE', { speed: 27, after: 440 }, id);
    await blank(id, 140);
    await databaseLine('CREW STATUS ............... ', 'SUSPENDED', { pause: 280, valueSpeed: 8, after: 220 }, id);
    await databaseLine('FLIGHT OPERATIONS ......... ', 'NOMINAL', { pause: 180, valueSpeed: 8, after: 850 }, id);

    glitch();
    flash();
    tone(480, .14, .04, 'sine');
    tone(760, .11, .035, 'sine', .13);
    await sleep(300);
    clearOutput();
    footerState.textContent = 'PRIORITY COMMUNICATION';
    await typeLine('> INCOMING PRIORITY TRANSMISSION', { speed: 47, className: 'alert', before: 100, after: 900 }, id);
    noiseBurst(.13, .027, 1800);
    await databaseLine('SOURCE .................... ', 'ELLISON-TANAKA COLONIAL SYSTEMS', { labelSpeed: 20, pause: 380, valueSpeed: 10, after: 220 }, id);
    await databaseLine('AUTHENTICATION ............ ', 'VERIFIED', { pause: 300, valueSpeed: 8, after: 160 }, id);
    tone(620, .08, .025, 'sine'); tone(980, .12, .02, 'sine', .08);
    await databaseLine('ENCRYPTION KEY ............ ', 'ACCEPTED', { pause: 260, valueSpeed: 8, after: 450 }, id);
    await blank(id, 90);
    await typeLine('CORPORATE NAVIGATION DIRECTIVE', { speed: 38, className: 'critical', after: 180 }, id);
    await typeLine('PROCESSING...', { speed: 52, className: 'dim', after: 1100 }, id);
    await databaseLine('PRIMARY FLIGHT PLAN ........ ', 'SUSPENDED', { pause: 540, valueSpeed: 11, after: 480 }, id);
    setAmbience(.18, .5);
    await databaseLine('NAVIGATION AUTHORITY ....... ', 'TRANSFERRED', { className: 'critical', labelSpeed: 31, pause: 1150, valueSpeed: 19, after: 750, relaySound: true }, id);
    setAmbience(.72, .8);

    glitch();
    await sleep(250);
    clearOutput();
    footerState.textContent = 'FLIGHT PLAN AMENDMENT';
    await databaseLine('COURSE CORRECTION .......... ', 'ACCEPTED', { pause: 420, valueSpeed: 8, after: 340 }, id);
    await blank(id, 70);
    await databaseLine('DESTINATION ................ ', 'LV-872 / ORISON', { pause: 330, valueSpeed: 11, after: 220 }, id);
    await databaseLine('INSTALLATION ............... ', 'HORIZON BASE', { pause: 310, valueSpeed: 11, after: 220 }, id);
    await databaseLine('MISSION DATE ............... ', '30 AUG 2122', { pause: 280, valueSpeed: 11, after: 520 }, id);
    await databaseLine('COURSE CORRECTION .......... ', 'EXECUTING', { className: 'critical', pause: 520, valueSpeed: 12, after: 950, relaySound: true }, id);

    clearOutput();
    footerState.textContent = 'MISSION RESOURCE ANALYSIS';
    await typeLine('CREW REQUIREMENT ANALYSIS...', { speed: 33, className: 'accent', after: 700 }, id);
    await databaseLine('MISSION PERSONNEL REQUIRED ........ ', '07', { pause: 360, valueSpeed: 12, after: 250 }, id);
    await typeLine('VERIFYING ASSIGNED PERSONNEL...', { speed: 26, className: 'dim', after: 420 }, id);

    const personnel = [
      { display: 'KOSMONAVT, KATYA', role: 'SYNTHETIC SYSTEMS SPECIALIST', synthetic: true },
      { display: 'PHALANGE, REGINA, DR.', role: 'MEDICAL OFFICER' },
      { display: 'FRITIGERN, ALARIC, DR.', role: 'XENOSCIENCE RESEARCH OFFICER' },
      { display: 'SPARXXX, BUBBA', role: 'MILITARY OPERATIONS LIAISON' },
      { display: 'MAAS, KIERAN', role: 'CORPORATE MISSION AUTHORITY' },
      { display: 'ANDERS, LENA', role: 'PRIMARY FLIGHT OFFICER' },
      { display: 'RENFIELD, THOMAS', role: 'SECONDARY FLIGHT OFFICER' }
    ];

    for (let index = 0; index < personnel.length; index += 1) {
      if (!active(id)) return;
      if (index === 3 || index === 6) glitch();
      if (index === 4) { await sleep(280); clearOutput(); }
      await renderPersonnel(personnel[index], index, id);
    }

    await sleep(520);
    clearOutput();
    footerState.textContent = 'PERSONNEL VERIFIED';
    await databaseLine('MISSION PERSONNEL .......... ', 'VERIFIED', { pause: 260, valueSpeed: 7, after: 130 }, id);
    await databaseLine('FLIGHT CREW ................ ', 'VERIFIED', { pause: 210, valueSpeed: 7, after: 130 }, id);
    await databaseLine('MEDICAL SUPPORT ............ ', 'VERIFIED', { pause: 210, valueSpeed: 7, after: 130 }, id);
    await databaseLine('MISSION AUTHORITY .......... ', 'VERIFIED', { pause: 210, valueSpeed: 7, after: 360 }, id);
    await blank(id, 70);
    await databaseLine('REVIVAL SCHEDULE ........... ', 'AMENDED', { className: 'critical', pause: 470, valueSpeed: 10, after: 250, relaySound: true }, id);
    await databaseLine('SCHEDULED REVIVAL .......... ', '29 AUG 2122', { pause: 260, valueSpeed: 9, after: 180 }, id);
    await databaseLine('CREW NOTIFICATION .......... ', 'DEFERRED', { pause: 360, valueSpeed: 11, after: 540 }, id);
    await showCountdown(id);
    setAmbience(.34, .7);
    // Keep this dramatic hold at its real duration even in accelerated QA mode.
    await sleep(SPEED_MULTIPLIER < 1 ? 3600 / SPEED_MULTIPLIER : 3600);

    clearInterval(countdownTimer);
    clearOutput();
    setAmbience(.58, .5);
    footerState.textContent = 'AUTONOMOUS FLIGHT RESUMED';
    await databaseLine('CRYOGENIC SYSTEMS .......... ', 'NOMINAL', { pause: 240, valueSpeed: 8, after: 180 }, id);
    await databaseLine('AUTONOMOUS FLIGHT .......... ', 'RESUMED', { pause: 260, valueSpeed: 8, after: 620 }, id);
    await typeLine('> RETURNING SYSTEMS TO STANDBY', { speed: 31, className: 'dim', after: 900 }, id);
    tone(310, .22, .022, 'sine');
    setAmbience(.05, 2.1);
    await sleep(1300);

    clearOutput();
    const sting = document.createElement('div');
    sting.className = 'sting';
    sting.innerHTML = '<div><img src="../assets/img/ellison-tanaka-logo.svg" alt="Ellison-Tanaka"><p>HERE\'S TO A BEAUTIFUL FUTURE</p></div>';
    output.append(sting);
    tone(520, .25, .014, 'sine');
    await sleep(3200);
    terminal.classList.add('blackout');
    setAmbience(0, 1.8);
    await sleep(2200);
    stopAmbience();
  }

  async function start() {
    initializeAudio();
    if (audioContext?.state === 'suspended') await audioContext.resume();
    initialize.classList.add('hidden');
    await runSequence();
  }

  startButton.addEventListener('click', start);
  restartButton.addEventListener('click', start);
  muteButton.addEventListener('click', () => {
    muted = !muted;
    muteButton.textContent = muted ? 'UNMUTE' : 'MUTE';
    muteButton.setAttribute('aria-pressed', String(muted));
    if (masterGain) masterGain.gain.value = muted ? 0 : .56;
  });
  fullscreenButton.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch (_) {}
  });

  setInterval(() => {
    const now = new Date();
    shipClock.textContent = [now.getHours(), now.getMinutes(), now.getSeconds()].map((value) => String(value).padStart(2, '0')).join(':');
  }, 250);
})();
