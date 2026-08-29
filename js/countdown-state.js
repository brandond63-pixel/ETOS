(() => {
  'use strict';

  const DEFAULT_DURATION_MS = 4 * 60 * 60 * 1000;
  const MAX_DURATION_MS = 99 * 60 * 60 * 1000 + 59 * 60 * 1000 + 59 * 1000;
  const VALID_STATUSES = new Set(['idle', 'running', 'paused', 'expired']);
  const clampDuration = value => Math.max(0, Math.min(MAX_DURATION_MS, Number.isFinite(Number(value)) ? Math.round(Number(value)) : 0));

  function normalize(value = {}, now = Date.now()) {
    const configuredMs = clampDuration(value.configuredMs ?? DEFAULT_DURATION_MS) || DEFAULT_DURATION_MS;
    const timer = {
      configuredMs,
      status: VALID_STATUSES.has(value.status) ? value.status : 'idle',
      targetTimestamp: value.targetTimestamp === null || value.targetTimestamp === undefined ? null : Number.isFinite(Number(value.targetTimestamp)) ? Number(value.targetTimestamp) : null,
      pausedRemainingMs: clampDuration(value.pausedRemainingMs ?? configuredMs)
    };
    if (timer.status === 'running' && timer.targetTimestamp === null) timer.status = 'idle';
    if (timer.status === 'running' && timer.targetTimestamp <= now) {
      timer.status = 'expired';
      timer.targetTimestamp = null;
      timer.pausedRemainingMs = 0;
    }
    if (timer.status === 'expired') {
      timer.targetTimestamp = null;
      timer.pausedRemainingMs = 0;
    }
    return timer;
  }

  function remainingMs(timer, now = Date.now()) {
    if (timer.status === 'running') return Math.max(0, timer.targetTimestamp - now);
    if (timer.status === 'expired') return 0;
    return clampDuration(timer.pausedRemainingMs);
  }

  function displaySeconds(timer, now = Date.now()) {
    return Math.max(0, Math.ceil(remainingMs(timer, now) / 1000));
  }

  function format(totalSeconds) {
    const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }

  function alertFor(totalSeconds) {
    const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
    if (seconds === 0) return { level: 'expired', text: 'SURFACE RECOVERY UNAVAILABLE // WEATHER LIMIT EXCEEDED' };
    if (seconds <= 10 * 60) return { level: 'critical', text: 'EXTRACTION VIABILITY CRITICAL' };
    if (seconds <= 30 * 60) return { level: 'degraded', text: 'RECOVERY WINDOW DEGRADED' };
    if (seconds <= 60 * 60) return { level: 'advisory', text: 'WX ADVISORY // STORM FRONT APPROACHING' };
    return { level: 'nominal', text: 'ARGOZA SURFACE RECOVERY WINDOW // NOMINAL' };
  }

  function start(timer, now = Date.now()) {
    const duration = clampDuration(timer.configuredMs);
    timer.status = duration > 0 ? 'running' : 'expired';
    timer.targetTimestamp = duration > 0 ? now + duration : null;
    timer.pausedRemainingMs = duration;
    return timer;
  }

  function pause(timer, now = Date.now()) {
    if (timer.status !== 'running') return timer;
    timer.pausedRemainingMs = remainingMs(timer, now);
    timer.targetTimestamp = null;
    timer.status = timer.pausedRemainingMs > 0 ? 'paused' : 'expired';
    return timer;
  }

  function resume(timer, now = Date.now()) {
    if (timer.status !== 'paused') return timer;
    const remaining = clampDuration(timer.pausedRemainingMs);
    timer.status = remaining > 0 ? 'running' : 'expired';
    timer.targetTimestamp = remaining > 0 ? now + remaining : null;
    return timer;
  }

  function adjust(timer, deltaMs, now = Date.now()) {
    const delta = Number(deltaMs) || 0;
    if (timer.status === 'running') {
      const adjusted = clampDuration(remainingMs(timer, now) + delta);
      timer.targetTimestamp = adjusted > 0 ? now + adjusted : null;
      timer.pausedRemainingMs = adjusted;
      timer.status = adjusted > 0 ? 'running' : 'expired';
    } else {
      const adjusted = clampDuration(remainingMs(timer, now) + delta);
      timer.pausedRemainingMs = adjusted;
      if (timer.status === 'idle') timer.configuredMs = adjusted;
      timer.status = adjusted > 0 ? timer.status === 'idle' ? 'idle' : 'paused' : 'expired';
    }
    return timer;
  }

  function setDuration(timer, durationMs) {
    const duration = clampDuration(durationMs);
    timer.configuredMs = duration;
    timer.pausedRemainingMs = duration;
    timer.targetTimestamp = null;
    timer.status = duration > 0 ? 'idle' : 'expired';
    return timer;
  }

  function reset(timer) {
    const duration = clampDuration(timer.configuredMs);
    timer.status = duration > 0 ? 'idle' : 'expired';
    timer.targetTimestamp = null;
    timer.pausedRemainingMs = duration;
    return timer;
  }

  window.ETOSCountdown = { DEFAULT_DURATION_MS, MAX_DURATION_MS, normalize, remainingMs, displaySeconds, format, alertFor, start, pause, resume, adjust, setDuration, reset };
})();
