# 2026-08-26 — v0.5.88-dev

- Replaced only the `sequence` content in `js/argoza-recovery.js` with the user-supplied shortened recovery script.
- Retained the existing helper types and presentation semantics: narrative arrays accumulate through progressive paragraph-line fades, while ETOS arrays type character-by-character with previous lines retained.
- Preserved the 3750 ms isolated dramatic hold, 3800 ms interrupted-status hold, 4200 ms no-action hold, 2000 ms final welcome hold, and all shared narrative hold calculations.
- Left the animation controller, typing loop/audio callback, Pause/Resume, Skip, Replay, `Intro.mp3`, ambience duck/crossfade, and final transition code unchanged.

# 2026-08-26 — v0.5.87-dev

- Added `assets/audio/Intro.mp3` to the shared Web Audio sample loader with MP3 decode support limited to the new recovery cue.
- Added a dedicated adjustable `music` bus at 0.12 under the existing master bus, plus singleton non-looping recovery playback with a two-second gain ramp.
- Recovery startup now ducks the existing synthesized terminal ambience to 28 percent while leaving it running. The final overlay fade simultaneously fades out the score and restores that same ambience instance to its normal level.
- Normal completion retains its 1800 ms fade. Skip now uses the requested short 1200 ms synchronized fade. Pause does not pause ship ambience or music, while Replay disposes any previous cue before restarting from time zero.
- Leaving recovery through terminal transfer, boot return, reset, refresh lifecycle, or a replacement replay invokes immediate music cleanup through the existing recovery stop path.
- Left narrative holds, sentence cadence, ETOS typewriter speed, typing oscillator behavior, prose, controls, and terminal rendering unchanged.

# 2026-08-26 — v0.5.86-dev

- Traced the original standalone `cryo/script.js` typewriter audio path and ported its oscillator creation, frequency randomization, square waveform, gain envelope, duration, stop tail, and per-character trigger gate into the shared audio engine as `playCryoTypeTick()`.
- Removed recovery's additional `index % 6` filtering and generic `process` sound, so its existing even-index, non-space character loop now produces the same independent overlapping tick instances as the original sequence.
- Raised the normal completed-paragraph hold from 1250 ms to 2750 ms and longer-paragraph holds to 3250 ms. The isolated dramatic beat retains its prior extra second at 3750 ms, exactly 1500 ms above its former hold.
- Left `TYPE_SPEED = 32`, randomized character timing, sentence cadence, line/fade durations, prose, ETOS text, controls, persistence, and terminal transition unchanged.

# 2026-08-26 — v0.5.85-dev

- Reduced 29 prose fade cycles to 17 progressive narrative paragraphs; all lines are laid out up front and revealed individually so earlier text remains fixed and visible as each paragraph builds.
- Set narrative line fade-in to 420 ms, spoken cadence to 650–1300 ms by line length, completed-paragraph hold to 1250 ms, paragraph fade-out to 500 ms, and inter-paragraph gap to 300 ms.
- Retained a 2250 ms completed hold for the isolated `You shouldn’t be awake yet.` beat.
- Changed the recovery base to solid `rgb(0,4,8)` and moved the translucent CRT texture above that opaque layer.
- Left `TYPE_SPEED = 32`, `typeLine()`, `showEtos()`, ETOS block holds/fades/gaps, persistence, Pause/Resume, Skip, Replay, and Warden reset behavior unchanged.

# 2026-08-25 — v0.5.84-dev

- Integrated the player recovery narrative as a full-viewport overlay appended inside the live terminal screen after Argoza renders; completion removes the overlay and reveals the already-interactive Home view.
- Ported the standalone cryo sequence's line/cursor/character-loop behavior into an Argoza-only controller, with pause-aware waits and Web Animations so pause/resume preserves the exact current beat and typed character.
- Persisted only `etos.argoza.recovery-seen.v1`; completion and Skip set it, Replay leaves other state intact, and the new Warden reset clears only this flag.
- Added iPad-first constrained typography, no-scroll staging, cyan CRT styling, small Pause/Skip utilities, and a discreet post-completion replay button in the Argoza navigation footer.

# 2026-08-25 — v0.5.83-dev

- Corrected Communications playback overflow at the shrinking grid/flex descendants; the long Signal Route now wraps and the existing audio, waveform, selection, and audit behavior remain intact.
- Simplified Weather render markup to Active Weather System, Storm Metrics, Date/Time, Horizon Base impact, Regional Outlook, and Latest Observations around a larger central map.
- Advanced the Weather layout preference key so the narrower side-column defaults take effect, and changed only the Weather map fitter from contain to cover while preserving the shared source-art coordinate system.
- Added coordinate-space clipping for the rotating storm and a 1.3-second brightness/opacity pulse on `IMMINENT`.

# 2026-08-25 — v0.5.82-dev

- Added a Command-scoped correction layer for the two Overview overlays, Directive 015 archive geometry, Communications row allocation, and stable Command Key/Audit Data rail stacking.
- Kept the full Communications dates in the record model and detail view while using `MM/DD/YY` only in the compact index rows.
- Preserved Command workflows, production hold timings, stored Weather coordinates, persistence behavior, and all narrative content.

# 2026-08-25 — v0.5.81-dev

- Removed only the `argoza-map-feature is-dam` markup from `renderArgozaSectorView()`.
- Left the Horizon Sector image, marker elements and values, hotspot behavior, developer-control renderer, and forward/back planetary navigation unchanged.

# 2026-08-24 — v0.5.80-dev

- Established Command-only `clamp()`-based typography, spacing, padding, touch-target, rail, and modal variables with a stable chrome → flexible workspace → contained panel architecture.
- Moved the rail Audit Token block back into normal flex flow, removing the compact rail overflow caused by its old absolute positioning.
- Removed Weather, Communications, Facility, map, and record-browser desktop minimum-width assumptions at the iPad breakpoint; retained the fitted-art coordinate layers and map interaction logic unchanged.
- Added bounded internal scrolling for dense lists and documents, larger touch areas for map and workflow controls, and Command-scoped Warden modal containment.
- Advanced the Communications and Facility typography preference keys so the new canonical defaults replace incompatible legacy desktop tuning.
- Corrected the Weather coordinate-space collapse with a Command-only 1672:941 aspect ratio; this restores the existing forecast path, site markers, labels, and scale without changing their stored coordinates or the shared map-fitting function.
- Browser QA at 1024×768 exercised Overview, Weather, Directive index/document, Communications/diagnostic, Facility comparison/home/personnel/biosignals/map, room selection, all sanitization states, Audit Token manual fallback/acquisition states, and the Warden final-countdown control. Representative 1366×900 checks covered Overview and Weather. No screen-level horizontal overflow or undersized visible controls remained; intentionally long documents, lists, sidebars, and Warden controls scroll internally.
- Restored the original three-second Warden, Command Key, and Audit Token holds after accelerated state testing. A fresh v0.5.80 load reported no console warnings or errors.

# 2026-08-24 — v0.5.79-dev

- Mapped `assets/img/fritigern.png` onto Dr. Alaric Fritigern's existing Away Team card; the shared portrait frame, containment, and CRT styling remain unchanged.
- Removed only the `RIVER SYSTEM` and `RESERVOIR` positioned annotations from the Horizon Sector render template, retaining `DAM / WATER CONTROL` and the complete underlying terrain artwork.
- Preserved Horizon Base and Heron Station marker values, planetary forward/back navigation, developer controls, Crew layout, and Cryogenic Bay behavior.

# 2026-08-24 — v0.5.78-dev

- Reworked Briefing Files → Personnel Manifest into large Support/Military selectors with one vertically ordered roster visible at a time; opening the file always selects Support.
- Kept all 25 existing names, roles, subgroup hierarchy, and `RANK/TITLE LAST NAME, FIRST NAME` strings unchanged, with no KIA/MIA state.
- At 1024×768, verified 52 px selector height, 14 px subgroup headers, 12 px names, 10 px roles, full-width single roster rows, visibly separated subgroup sections, a Support roster that fits without scrolling, and contained vertical scrolling for the longer Military roster.
- Verified Military swaps into the same panel immediately and Support resets when the manifest is reopened; desktop at 1366×768 uses the same single-roster structure.
- Replaced persisted dev visibility with a runtime-only Warden-authorized flag. Fresh initialization and refresh start hidden; the authenticated checkbox still reveals Argoza marker panels and export controls for the current session.
- Browser QA verified boot exposes only Initialize, Initialize loads ETV Argoza directly, Warden authorization gates terminal selection, the original three-second Warden hold is restored, and the console is clean.

# 2026-08-24 — v0.5.77-dev

- Finalized planetary marker defaults: System Orison 82.7/49/1; Argoza Approach 70/65/1; Orison Horizon Sector 55/44.5/0.5; Sector Horizon Base 46.3/45.6/0.5; Sector Heron Station 65/50/0.5.
- Advanced `etos.argoza.planetary-markers.v1` to `v2`, isolating the required marker-default refresh without clearing session state or unrelated developer preferences.
- Made no coordinate, sizing, artwork, label, navigation, animation, developer-control, or pan/zoom changes.

# 2026-08-24 — v0.5.76-dev

- Audited fixed marker boxes: System Orison 54×54 px, Argoza approach 10×10 px, Orison Sector 84×58 px, and Horizon Sector sites 22×22 px.
- Converted those shapes to 7.27%, 1.35%, 16.91%, and 4.02% of their fitted artwork width, respectively; aspect ratios remain explicit and device-independent.
- At 1024×768 and 1366×768, Horizon and Heron anchor boxes measured approximately 4.02% of artwork width and their rotated diamonds approximately 5.68%.
- At developer scale 1.5, the selected anchor measured approximately 6.03% and its rotated diamond approximately 8.52% at both viewports, with no X/Y movement.
- Verified developer scale persistence through reload, restored both Sector markers to scale 1, and confirmed System/Orison marker fractions remain constant across both viewports.
- Horizon Base room hit areas required no change because their dimensions were already percentage-based inside the shared artwork/pan/zoom coordinate space.

# 2026-08-24 — v0.5.75-dev

- Confirmed source dimensions of 1536×1024 (System), 1254×1254 (Orison), 1672×941 (Horizon Sector), and 333×318 (Horizon Base SVG viewBox).
- Changed map images to establish undistorted wrapper height with `width: 100%` and `height: auto`; overlays now have the exact same rendered rectangle as the artwork.
- Removed label dimensions from marker anchoring. At 1024×768 and 1366×768, the Horizon icon remains at approximately 46.3% / 45.6% and Heron remains at approximately 71% / 51.5% through resizing.
- Verified developer X edits update immediately, persist through reload, and restore without device-specific values.
- Verified Horizon Base image and room hit areas remain in one shared transform; the Command room stayed at approximately 55.6% / 19.8% before and after 1.18× zoom.
- Registered the development cache-clearing worker and upgraded `CHECK FOR LATEST BUILD` to unregister old workers, clear ETOS origin caches, and perform a versioned reload.

# 2026-08-23 — v0.5.74-dev

- Command System Overview now uses a tablet-first 3-column / 3-row grid in normal player mode.
- Removed persisted absolute box coordinates from the normal overview render path; they are applied only while the Warden layout editor is active.
- Added bounded responsive typography and explicit bottom-row placement for Planetary Conditions and Facility Management.
- Added a portrait fallback with internal overview scrolling while retaining landscape as the intended presentation.

# 2026-08-23 — v0.5.73-dev

- Added a reusable measured artwork coordinate space for responsive Argoza maps.
- System, Orison, and Horizon Sector images now retain their intrinsic aspect ratio without separating markers from the rendered image bounds.
- Horizon Base floorplan and room hotspots now use the floorplan SVG viewBox ratio inside the existing common pan/zoom canvas.
- Command weather map layers now share the terrain image's 1672:941 coordinate space and common map zoom transform.
- Existing developer X/Y values, navigation, animations, and room interactions remain unchanged.

# 2026-08-23 — v0.5.72-dev

## Sanitization post-activation alarm refinement

- Added explicit activation and final-countdown alarm modes to the shared facility-alarm controller.
- The activation mode schedules one 15-second alarm window followed by a 350 ms gain fade and source cleanup; countdown and Command Key state remain untouched.
- Added authenticated Warden mute control state synchronized through facility-alarm lifecycle events.
- Starting the manual final countdown cancels any activation cutoff or creates a fresh alarm source, retains number-by-number ducking, permits mute without cancelling speech, and fades the alarm 1.5 seconds after `ONE`.
- Re-enabled the final-countdown control after every completed run and removed render, Warden-open, and audio-unlock code paths that previously restarted the facility alarm implicitly.
- Preserved the warning-pulse controller, selected-delay speech, authorization flow, visual sanitization countdown, and unrelated ETOS systems.

# 2026-08-20 — v0.5.71-dev

## Sanitization runtime URL and origin diagnostics

- Replaced `document.baseURI`-relative sanitization paths with URLs derived from the currently executing `js/audio.js` URL, preserving the runtime origin and deployment subdirectory while inheriting the current build query dynamically.
- Added authenticated Warden diagnostics for the live browser version, origin, pathname, full resolved URLs, HTTP status, MIME type, response bytes, and decode result.
- Classified fetch, HTTP, HTML app-shell fallback, MIME, zero-byte, non-WAV, and decode failures separately and retained their exact errors in the Warden display.
- Kept both direct playback controls and made each available only after its corresponding browser fetch validates and decodes successfully.
- Preserved sanitization cadence, gain, voice, alarm sequencing, and all unrelated audio behavior.

# 2026-08-20 — v0.5.70-dev

## Sanitization desktop-runtime direct-output diagnostic

- Moved the warning-controller request to the exact state mutation that sets `keyEngaged=true` and immediately invokes the first pulse before the reveal rerender.
- Added an async warning-source creator that waits for its decoded buffer, creates a fresh one-shot `AudioBufferSourceNode`, and suppresses late playback if the workflow stops during loading.
- Warning pulses, the looping facility alarm, and both Warden direct tests now use source gain `1.0` and connect their per-source gain directly to `AudioContext.destination`, bypassing the sanitization and master buses for diagnosis.
- Anchored facility playback directly to the working activation speech completion callback, retaining the existing 5.2-second fallback if desktop speech completion never fires.
- Added exact requested workflow logs plus source/master/sanitization/duck gain-chain reporting.
- Preserved Command Key animation, authorization, timer selection, speech wording and voice, Audit Token audio, UI sounds, ambient hum, and the Warden final countdown behavior.

# 2026-08-20 — v0.5.69-dev

## Sanitization audio asset-pipeline correction

- Traced the audible click and ambient hum to their synthesized Web Audio sources; they have no repository URL. Traced file-backed mechanical sounds and sanitization WAVs through the same `SAMPLE_PATHS` → browser `fetch` → `decodeAudioData` → `AudioBufferSourceNode` pipeline.
- Confirmed the exact warning and facility files exist under `assets/audio/` and match the supplied Downloads copies by SHA-256.
- Replaced the session-wide one-shot sample promise with retryable per-asset loads so an early 404, stale fallback response, or decode failure cannot permanently poison the Warden tests.
- Added resolved-URL, HTTP status, content type, byte count, RIFF/WAVE signature, and decoded-duration validation. HTML/app-shell and zero-byte responses now fail explicitly.
- Direct Warden tests force a fresh validated fetch of their respective WAV before playback and show `LOADED` or `FAILED` in the authenticated controls.
- Advanced the build and sanitization asset query keys to `0.5.69`; the development service worker continues to clear old caches rather than precaching any audio assets.
- Preserved the existing synth click/hum, speech, Audit Token audio, sanitization timing, and stage cadence.

# 2026-08-20 — v0.5.68-dev

## Medical Data Module and biometric scanner corrections

- Rebuilt the Recommended Procedure strip as three equal grid cells with explicit zero-padded step labels.
- Added a monochrome final sanitization authorization view before the existing three-second Data Module hold; cancel returns safely to Media Service.
- Duplication and sanitization now show their existing completion result briefly, then return to Media Service while preserving archive and sanitized-record state.
- Added a dedicated Web Audio biometric lifecycle: 108 Hz contact hum with a restrained 216 Hz body tone, a 515 Hz scan sweep modulated at the fingerprint animation's 1.3-second period, faint 820–875 Hz ticks, and one 535–735 Hz verification chirp.
- Early release, modal close, terminal transfer, and Warden/dev reset stop the biometric scanner immediately without playing the success tone.

# 2026-08-20 — v0.5.67-dev

## Personnel access-code normalization

- Personnel Briefing codes now validate case-insensitively after trimming surrounding whitespace.
- The input remains a visible text field; stored codes and briefing records are unchanged.

# 2026-08-20 — v0.5.66-dev

## Personnel Briefings location correction

- Restored the Mission summary to its pre-Personnel-Briefings content and controls.
- Added `PERSONNEL BRIEFINGS` to the existing Briefing Files data list using the established file-row treatment.
- Routed the file row to the existing restricted access and document views.
- Access-screen back now returns to the standard Briefing Files browser; document back still clears and returns to access.

# 2026-08-20 — v0.5.65-dev

## Argoza Personnel Briefings

- Added a transient Mission subview for secure personnel assignment briefings without changing the Argoza shell or global navigation.
- Kept all approved briefing copy in one data-driven code-keyed structure.
- Added exact case-sensitive access validation, immediate invalid-code retry, and non-masked entry.
- Added a compact two-column document layout optimized for landscape iPad reading with a contained short-scroll fallback.
- Kept the Facility Control Key briefing generic so the Command Terminal retains the Facility Sanitization reveal.

# 2026-08-19 — v0.5.64-dev

## Facility Sanitization audio output

- Confirmed both supplied WAV files are present under `assets/audio/`, match their source files, and contain healthy non-silent PCM audio.
- Identified the shared `master × system × source` gain chain as the cause of the samples being reduced to roughly one-tenth of their source level.
- Added a dedicated sanitization gain bus feeding the existing master output, with no change to unrelated ETOS UI, ambient, system, or mechanical audio.
- Added authenticated Warden controls for direct warning-pulse and facility-alarm playback independent of sanitization workflow state.
- Added explicit URL/load/start/end/error diagnostics and playback-state data attributes for iPad and desktop troubleshooting.
- Inspected `service-worker.js`: this development build has no registered precache pipeline, so no stale audio-cache manifest required an update. The two sanitization WAV URLs and JavaScript references are query-versioned at `0.5.64`; the WAV fetches no longer force a potentially stale HTTP-cache response.

# 2026-08-19 — v0.5.63-dev

- Corrected sanitization asset paths to the exact supplied, case-sensitive filenames and verified project copies against their source SHA-256 hashes.
- Removed the oscillator/noise fallback from `sanitizationPulse`; a missing or undecodable warning WAV now emits a `[SanitizationAudio]` console error instead.
- Added direct-gesture audio preparation, stage/pulse/alarm diagnostics, announcement-end alarm handoff, a single alarm loop, and explicit alarm-gain restoration after Warden speech.
- Reworked the Warden countdown as an in-memory active lock that automatically clears after `One`, permitting repeated narrative cues without changing sanitization state.

# 2026-08-18 — v0.5.62-dev

- Routed the pre-activation sanitization cadence through `sanitization-warning-pulse.wav` and added a persistent `facility-emergency-alarm.wav` Web Audio loop.
- Added a Warden-only, persisted one-use final countdown independent of the visual delay timer; the shared deep ETOS voice speaks ten through one at one-second intervals.
- Alarm source gain is `0.42`, duck gain is `0.12`, with an 80 ms descent, 400 ms hold, and 380 ms recovery for each spoken number.

# 2026-08-17 — v0.5.61-dev

- Refined the Audit Token D-sub pin geometry without altering the housing or fixed rail placement.
- Updated shared Audit Token speech synthesis to rate `0.78`, pitch `0.68`, and volume `0.86`.

# 2026-08-17 — v0.5.60-dev

- Implemented the Horizon Base Command Audit Token hardware and Incident Data Acquisition Protocol.
- Added SpeechRecognition-based `INITIALIZE` authorization, three attempts, and case-insensitive `HBADT872` fallback.
- Added consistent abort cleanup across detection, voice, retry, manual authentication, confirmation, acquisition progress, and completion screens.

# 2026-08-17 — v0.5.59-dev

- Corrected the Medical Auto-Injector flow so the terminal-mounted port is the only reservoir registration hold.
- Remaining injector holds now complete at threshold and suppress release-generated actions.
- Added independent Command and Medical sequence resets inside authenticated Warden controls.

# 2026-08-16 — v0.5.58-dev

- Replaced the variable-length media progress list with three reserved completed rows, one fixed current row, and one fixed pending row.
- Moved DATA MODULE hold completion into the threshold timer and retained click suppression until the eventual pointer release.
- Confined all drive and biometric activity to dedicated LEDs/scan targets while keeping their chassis stationary.
- Added a single bulk injection sequence over a snapshot of currently viable vials; seal and retention values remain untouched.
- Individual and bulk results now return to the refreshed vial-selection screen after a brief result display.

# 2026-08-16 — v0.5.57-dev

- Extended `state.medical` with independent persisted duplication, sanitization, injector-registration, biometric-session, and per-vial viability values.
- Kept both new hardware flows inside the existing Medical renderer and delegated event architecture; no shared terminal, Warden, Command, or hidden-hack flow was replaced.
- Implemented irregular media LED/head motion, readable rolling file progress, iPad-sized fingerprint contact controls, and a 3.6-second injection sequence.
- Browser-validated tap feedback, both seven-second media operations, post-sanitization record gating, unavailable post-wipe duplication, injection of Vial 02, and persistence after reload.

# 2026-08-16 — v0.5.56-dev

- Assigned both Organization Directory header children explicitly to grid row 1.
- Kept the tracker in column 1 and moved the directory metadata/title block to the right edge of column 2.
- Restored the directory header to its established 78 px minimum height while preserving existing CRT button treatment and behavior.

# 2026-08-16 — v0.5.55-dev

- Reused the Organization Directory header grid rather than restructuring the Facility Management renderer.
- Positioned the existing biosignal action in the unused left column and added a restrained CRT-styled leading border/background treatment for discoverability.
- Preserved the `data-facility-biosignal` route, authorization overlay, hidden override convention, and biosignal destination unchanged.

# 2026-08-16 — v0.5.54-dev

- Added a persisted `resumePhase` to the existing Sanitization record, with migration fallback to secondary authentication.
- Normal abort now stores `auth`, `timer`, or `confirm` progress and stops the local warning without clearing the engaged-key session.
- Timer edits persist their valid numeric value so an interrupted timer-entry stage can be restored without reauthentication.
- An engaged-idle key tap restores the saved phase and restarts the single stage-appropriate warning controller without replaying insertion feedback.
- Removed the final proceed hold timer and acknowledgment path; the final warning screen now owns the single-click irreversible transition.
- Reverse key removal resets `resumePhase`, delay, authorization progress, warning state, and physical key state.

# 2026-08-16 — v0.5.53-dev

- Added a pre-execution-only abort state that clears authorization, transient delay data, and the warning controller without changing the physical key state.
- Kept the Command interlock accessible beside pre-execution overlays and reused its existing fixed hardware geometry for reverse removal.
- Added persistent removal phases so interrupted delayed turns recover safely to `NOT PRESENT` on reload.
- Reused the 3000 ms hold, 1500 ms release pause, 1050 ms mechanical turn, acknowledgment cue, and disengage sample for the reverse sequence.
- Rebuilt the synthesized Sanitization pulse as two 145 ms low sawtooth/harmonic/noise bursts separated by 190 ms; stage cadence remains 2750 / 1650 / 1000 / 525 ms.

# 2026-08-16 — v0.5.52-dev

- Replaced the phase-only Sanitization pulse loop with a single controller that cancels and restarts on meaningful stage changes.
- Mapped key engaged, password accepted, valid delay entered, and final confirmation to progressively faster local warning cadences.
- The valid-delay stage is derived from the existing timer inputs, preserving the current screens and navigation flow.
- Removed the pre-confirmation chirp from the active countdown and retained the existing initiation and completion audio behavior.
- Moved Web Audio initialization to Command Interlock pointer-down for iPad/Safari gesture reliability.

# 2026-08-16 — v0.5.51-dev

- Added a non-persistent presentation flag for the Sanitization overlay; toggling it never writes to or changes the persisted countdown, timestamps, phase, or completion state.
- Added a Warden-only `CLOSE SANITIZATION DISPLAY` / `SHOW SANITIZATION DISPLAY` control and raised the authenticated Warden modal above the Command protocol layer.
- Updated the dedicated Facility Sanitization credential while leaving other Command authorization routes unchanged.

# 2026-08-16 — v0.5.50-dev

- Reserved an absolute notification readout inside a fixed-height Command Interlock housing, preventing short-tap messages from reflowing the mounted hardware.
- Changed the turn sequence to animate the existing DOM tumbler for 1050 ms before committing the engaged state and playing the mechanical lock sample.
- Isolated Facility Sanitization authentication from the other Command authorization routes and updated its input for the supplied six-digit credential.
- Reworded the timer action from review to explicit confirmation.

# 2026-08-16 — v0.5.49-dev

- Implemented the Horizon Base Command Authority Interlock as a targeted Command-only addition.
- Reused the existing Command authorization credential for the required secondary authentication rather than introducing new lore or exposing a new code.
- Kept the receptacle in the shared Command rail so it remains visible across every Command module without changing Command navigation.
- Stored engagement, phase, selected delay, initiation time, completion time, and completion state in the existing ETOS session record.
- Added green-only escalating protocol presentation, touch-sized timer/confirmation controls, and centralized synthesized warning cues.

# 2026-08-15 — v0.5.48-dev

- Introduced `js/audio.js` as the single ETOS audio definition and routing module.
- Web Audio unlock occurs from `INITIALIZE TERMINAL`; failures are caught and never block UI behavior. A later ordinary workspace click can retry unlock for restored sessions.
- Procedural ambience uses independently drifting 55–65 Hz hum, second harmonic, filtered noise, and constrained 12–35 second incidental ticks, with boot-state fade-out.
- Added the untouched `09B_heavy_lock_disengage.wav` and `10C_jammed_mechanism_chatter.wav` sources under `assets/audio/`.
- Kept `archived-signal-0718.wav` and its HTML audio handlers unchanged and excluded its Play/Pause control from ETOS feedback.

# 2026-08-15 — v0.5.47-dev

- Darkened all supplied Argoza Crew portraits with `brightness(.72)` on the shared image rule.
- Raised the non-destructive cyan overlay to 14% while leaving the 1.5px / 18% alpha drop-shadow unchanged.
- Retained full image opacity, source transparency, normal blending, and unmodified PNG assets.

# 2026-08-15 — v0.5.46-dev

- Applied one shared, non-destructive cyan CRT treatment to Maas, Anders, Renfield, and Phalange portraits.
- Kept portrait alpha, sizing, `object-fit: contain`, normal blend mode, and full image opacity intact.
- Avoided duplicate local scanlines because `.crt-noise` already supplies the ETOS-wide 4px scanline treatment.

# 2026-08-15 — v0.5.45-dev

- Confirmed Away and Support portraits used the same image rendering CSS; Support-only selectors affected layout dimensions only.
- Unified all supplied Crew PNGs on `.argoza-portrait-image` with no filter, masking, blend mode, or reduced opacity.
- Versioned Crew image requests to invalidate a stale `phalange.png` browser response without modifying the source PNG.

# 2026-08-15 — v0.5.44-dev

- Added an explicit portrait-image reset using `filter: none`, full opacity, normal blending, and no CSS masking.
- Added `content: none` to the portrait-frame pseudo-element to prevent the retired mask renderer from returning through cascade or stale component styles.
- Applied only a low-opacity cyan box shadow to the frame; the portrait pixels remain unaltered.
- Confirmed the historical dark-rendering cause was the retired zero-opacity image plus cyan mask replacement.

# 2026-08-15 — v0.5.43-dev

- Applied a deliberately minimal Crew portrait integration effect: `drop-shadow(0 0 1px rgba(121,207,255,.18))`.
- Preserved normal opacity, normal blend mode, contain-style framing, original white/black artwork, and source transparency.
- Did not modify the four portrait PNG files.

# 2026-08-15 — v0.5.42-dev

- Removed the Argoza Crew portrait mask layer and portrait-specific recoloring.
- Restored normal transparent image rendering with `object-fit: contain`, centered framing, full opacity, no filter, and normal blend mode.
- Did not modify any portrait source asset.

# 2026-08-15 — v0.5.41-dev

- Applied an Argoza-wide visual consistency pass using theme-level cyan primary, secondary, line, and glow tokens.
- Added scoped hierarchy rules so unclassified Argoza body copy inherits cyan while metadata remains dimmer cyan.
- Replaced portrait filter/inversion rendering with CSS alpha masks driven by each existing transparent PNG.
- Preserved Home, Mission, Crew, Planetary, Briefing, Command, Medical, Edem, and Warden behavior.

# 2026-08-15 — v0.5.40-dev

- Applied all outstanding `ETOS_Argoza_Terminal_v15.md` overrides as a targeted Argoza-only patch.
- Reordered the Home dashboard around the arrival banner and increased selected Crew portrait/card scale without changing team navigation or cryogenic behavior.
- Replaced transform-based Mission entry motion with opacity-only staging and reserved the objective scrollbar gutter to prevent transient layout changes.
- Removed room hotspots from facility drag capture, added direct room selection handlers, and cleared stale drag state before ordinary hotspot taps.
- Updated the five marker defaults while preserving their existing Warden-only X/Y/Scale persistence and export tools.

# 2026-08-14 — v0.5.39-dev

- Applied all outstanding `ETOS_Argoza_Terminal_v14.md` overrides as one targeted Argoza patch.
- Added `ARGOZA_TARGET_DISPLAY`, five nested marker defaults, selected Crew team state, portrait mapping, and split facility-map presentation modes.
- Reused the existing Argoza map transform/pinch controller and Warden-owned developer visibility preference.
- Preserved Command, Medical, Edem, Warden authorization, shared shell, and existing static asset pipeline.

# 2026-08-13 — v0.5.38-dev

- Applied `ETOS_Argoza_Terminal_v11.md` as a targeted revision to the existing Argoza profile.
- Added centralized persistent Planetary marker coordinates under `etos.argoza.planetary-markers.v1`.
- Added shared Argoza facility-map focus configuration, Command-style 1.2-second motion, pointer pan, wheel/button zoom, and two-pointer pinch handling.
- Preserved Command, Medical, Edem, Warden authorization, switching, CRT shell, and existing developer systems.

# ETOS v0.5.37-dev — ETV Argoza Player Terminal

The Argoza profile now provides the initial player-facing ETOS environment through the existing shared shell. Fresh initialization routes directly to Argoza; Command, Medical, and Edem remain available only through the unchanged hidden Warden authorization and terminal switcher.

Argoza supplies five permanent mission sections, a device-clock arrival countdown configured by `ARGOZA_ARRIVAL_DATETIME`, a four-level System-to-Base planetary route, and one reusable clean facility-map renderer shared by Planetary and Briefing Files. Coded cyan overlays sit above the unchanged `orbital_map.png`, `orison.png`, regional terrain, and clean floorplan SVG assets.

Facility selection reveals only one room label at a time, includes constrained pan and zoom, supports mission-location shortcuts, and resets to an unlabeled overview. All public content remains pre-mission safe and excludes later Horizon findings, protected directives, hidden agendas, and live facility-state data.

# ETOS v0.5.36-dev — Dr. Claire Edem Personal Terminal

The existing Edem profile placeholder now renders a focused amber CRT workstation through the shared ETOS profile shell. Its permanent navigation exposes Mission Log, Research Notes, Personal Journal, and Outbox in one level, while entry selection remains a single additional action.

All approved content is stored in the `missionLogs`, `researchNotes`, `journalEntries`, and `outboxMessage` structures. The Mission Log presents five Edem-pinned records, one recent unarchived sequencing record, and a non-interactive larger-archive count. The Journal exposes only its three local-cache entries and represents the 35-entry remote archive as unavailable without creating fake documents or adding authorization.

The Edem theme reuses global terminal chrome and CRT effects while adding calmer open framing, amber hierarchy, the existing Ellison-Tanaka mark, and the unchanged `assets/img/grid_contour_map.svg` as a low-opacity pointer-inert survey layer. No override, password, or hack logic was added to the Edem terminal.

# v0.5.9-dev — Distress Beacon Carrier Monitor

The Command Overview Distress Beacon tile now opens a modal overlay instead of navigating to a separate Command subsection. The overview remains visible behind the dimmed popup, matching the interaction language used by the Atmospheric Advisory and Corporate Directive documents.

The popup identifies Heron Station as the authenticated source and presents a live automatic-carrier cycle. The displayed countdown updates once per second, while the progress rail uses frame-synchronized transforms for continuous degradation between number changes. At zero, the display enters a short `TRANSMITTING…` phase, increments the retransmission total, refills the rail, and starts a new 30-second countdown.

The retransmission default is `264,960`, matching 92 days of broadcasts at one transmission every 30 seconds. `RELAY HANDSHAKE // NO RESPONSE` distinguishes the station's missing acknowledgment from the broader Orbital Relay 04 online status.

The carrier deliberately provides no voice recording, audio controls, help message, survivor names, creature references, cause for the failed relay handshake, or confirmation of whether personnel remain alive.

# v0.5.8-dev — Active Directive Marker Alignment

The Directive 015 state marker previously used absolute right-edge positioning, causing it to drift into the Priority column at wide aspect ratios. The archive rows now define a dedicated center marker column between the directive title and priority metadata.

The marker uses larger text and a steady, equal-interval on/off blink. The remaining directive rows retain the same title, priority, and status alignment without placeholder content.

# v0.5.7-dev — Directive Overlay Presentation

The Directive Archive was visually compressed after widescreen testing revealed excessive negative space in the three equal-height records. The records now use compact ledger rows inside a centered maximum-width index rather than stretching to fill the available module height.

Directive 015 now receives immediate hierarchy through an incoming executive-directive notification, an active leading edge, and a `NEW // ACTIVE` marker. Once the document is successfully opened, the notification changes from review-required to mission-active for the current loaded session.

Individual directives now open as centered corporate-document overlays over the dimmed archive, following the interaction language established by the Atmospheric Advisory. The Directive 015 authorization screen and hidden hack animation use the same overlay layer. All supplied text, password behavior, three-second hidden emblem hold, and session-only relock behavior are unchanged.

# v0.5.6-dev — Corporate Directive Archive

The existing Corporate Directive detail placeholder was replaced with a self-contained Command subsystem. Opening the main Directive panel now presents only the three supplied records: ET-CS-001, ET-CS-014, and ET-CS-015. Directives 001 and 014 open normally. Directive 015 presents an executive clearance screen authorized for Dr. Claire Edem and 2LT Kaplan.

Directive 015 accepts authorization code `51895`. A second, deliberately undisclosed player-interface route is available for Warden-adjudicated hacking: holding the Ellison-Tanaka emblem on the lock screen for three seconds starts a four-second security bypass display and unlocks the document for the current application session. The hold produces no early feedback or visible hint.

All three documents use the final Claire Edem name and retain the provided corporate language, objectives, coordinates, status fields, and performance metrics. The archive and document viewer were implemented inside the existing Command module so the approved Command Overview layout, live editor, weather tools, terminal switching, and offline framework remain untouched.

# v0.5.5-dev

- Replaced the Command Overview panel defaults with the exact layout copied from the live editor.
- Preserved the approved typography and layout/animation defaults.
- Advanced overview storage keys to v7 and added a fresh migration marker so this build installs the new defaults once.
- Retained the visible repositioned Layout Editor toolbar and all developer controls.

# v0.5.4-dev

Adjusted the Command Overview live editor overlay after the v0.5.3 toolbar overlapped the top terminal chrome. The final CSS override positions it below both headers and constrains it to the visible viewport.

# v0.5.3-dev

- Reapplied approved Command Overview JSON using clean v6 storage keys.
- Added cache-busting asset URLs so old JavaScript and CSS cannot be reused.
- Moved Layout Editor controls to the top of the screen.
- Added clearly labeled panel-only and complete overview copy buttons.

## v0.5.2-dev — Main Window Baseline Lock

The approved Command Overview configuration is now part of the project source rather than only browser-local state. Future builds should inherit these constants unless the user explicitly approves a new baseline. Developer tools remain available for refinement.

## v0.4.9-dev — Control Binding Repair

The controls were correctly receiving input events and saving values, but the CSS variables were being written to the workspace parent. The overview canvas defined its own default variables, overriding inherited values. Both typography and layout settings now write directly to `.command-overview-shell`, which is the element consuming those variables.


## v0.4.3-dev — Command Overview Redesign
- Rebuilt the Command landing page as a Corporate Tactical / Retro-Futurist operations console.
- Added a dominant whole-panel weather alert and functional panels for distress beacon, corporate directive, communications, and base/orbital status.
- Added shaped CRT framing, stronger visual hierarchy, passive status stack, and identity rail.
- Added dedicated detail screens and Return to Systems navigation.
- Added visible loading and error states for large document images.
# ETOS Development Log

## v0.5.10-dev — Communications History and Archived Signal

The Command Communications placeholder was replaced with a dedicated two-column history interface. The left side presents six dated operational records in a clean message ledger, while the right side presents the selected record’s sender, recipient, delivery state, and recovered content. A summary rail distinguishes continued passive telemetry from the loss of two-way contact and reports two outgoing messages waiting for delivery.

The chronology now establishes the Surface Reconnaissance Assignment in December 2121, the Biological Specimen Report in February 2122, the executive mission change in March, loss of Orbital Relay contact in early July, Dr. Edem’s undelivered support request, and the interrupted automatic emergency report during the July 18 commissary event. Communications links to Directives 014 and 015 enter the existing archive normally; Directive 015 remains protected by its password and hidden Warden-controlled hack route.

The Unidentified Broadcast is separated from official traffic as a locally archived signal. Its player uses the approved 11.5-second V3 organic insect scream stored at `assets/audio/archived-signal-0718.wav`. Playback includes a custom waveform, progress rail, elapsed-time display, play/pause state, and clinical local-event logging language without revealing the signal’s true purpose.

The supplied transparent `ellison-tanaka-logo.svg` is now the only corporate identity image referenced by the visible interface. Boot, Directive documents, the hidden Directive 015 hack target, Weather branding, and Command navigation all use the same source asset, removing the dim rectangular background inherited from the prior PNG artwork.

## Entry 001 — Project Foundation
Date: 2026-07-22
Version: 0.1.0

### Objective
Create a stable, testable foundation for the Ellison-Tanaka Operating System before adding campaign-specific terminal content.

### Architectural Decision ADR-001
ETOS will be an offline-capable Progressive Web App built with plain HTML, CSS, and JavaScript. It will be installed to an iPad Home Screen and launched in standalone landscape mode.

### Implemented
- Core project directory and asset structure
- Corporate boot and initialization screen
- Shared terminal shell
- Hidden Warden control panel
- Four terminal identities
- Eight-second terminal transition
- Local state persistence
- Offline cache and install manifest

### Warden Interaction Decision
The Warden panel is opened by holding the corporate logo for three seconds. This keeps player-facing navigation free of visible administrative controls. A PIN provides an additional barrier against accidental access.

### State Decision
Session state is stored in `localStorage`. This is sufficient for the initial single-iPad implementation. Export/import tools can be added after the state model becomes more complex.

### Risks and Follow-Up
- iPad installation and audio behavior require real-device testing.
- Local hosting instructions must eventually be simplified for campaign-day setup.
- The Warden PIN is currently stored in client-side JavaScript and is intended as concealment, not security.
- Terminal-specific content architecture should be established before adding large amounts of data.

### Next Recommended Milestone
v0.2.0 — Terminal Module Framework
- Separate terminal definitions from application logic
- Add reusable file, message, personnel, and media components
- Add terminal-specific themes and navigation
- Add a Warden debug status view

## Entry 002 — Consolidated Device-Test Fixes

### Objective
Remove the display-state, hidden-control, and stale-cache problems discovered during the first iPad and iPhone tests.

### Findings
- CSS display declarations overrode the HTML `hidden` attribute.
- Warden access was only attached to the boot logo, making it inaccessible after initialization.
- Cache-first development behavior made tiny updates unnecessarily difficult to verify.

### Decisions
- Add a global `[hidden]` CSS rule.
- Bind the Warden hold gesture to both the logo and active terminal heading.
- Add explicit Return to Boot and Check for Latest Build controls.
- Use network-first loading for core code during development while retaining offline fallback.
- Publish complete replacement builds instead of asking the user to patch individual code lines.

### Next Milestone
Validate v0.1.3-dev on desktop and iPad, then begin v0.2.0 Terminal Module Framework.

## Entry 004 — One-Click Windows Development Server

### Objective
Remove third-party setup requirements from the desktop development loop.

### Decision
ETOS development packages now include a Windows batch launcher and a bundled PowerShell TCP web server. The launcher requires no Python, Node.js, Visual Studio Code, or browser extension.

### Operation
- Double-click `Start ETOS.bat`.
- ETOS opens at `http://localhost:8080`.
- The server sends no-cache headers so edits can be tested with a normal browser refresh.
- Closing the server window ends the local session.

### Scope
This launcher is intended for desktop development. GitHub Pages remains necessary for realistic iPad PWA, touch, standalone, and offline milestone tests.

## Entry 005 — Terminal Module Framework

### Objective
Prove that ETOS terminals can share one operating-system core without appearing identical.

### Decisions
- Command uses a dense operational dashboard and numbered module navigation.
- Medical uses a clean clinical layout, cyan palette, and vitals-oriented presentation.
- Dr. Edem uses a warm personalized desktop with folders and handwritten annotations.
- Argoza uses a blue shipboard console with navigation and cryogenic system panels.
- Command serves as the first complete reference module.
- Documents open through one reusable full-screen viewer.

### Validation Target
Confirm all Command navigation modules and document files open correctly, then switch through all four terminals and verify each has a distinct visual identity.


## Entry — v0.2.3-dev Planetary Weather Surveillance

Implemented the first polished Command Terminal subsystem. Weather telemetry uses bounded ranges rather than unconstrained random values. CRT effects are deliberately subtle for iPad readability. The command overview weather panel is functional and opens the full surveillance interface.


## Entry — v0.2.3-dev Weather Repair
The v0.2.2 weather refactor accidentally removed shared panel framing and relied on a single image element for the central composite. This build restores the complete panel styling and uses a redundant CSS background so the terrain/storm remains visible even if the image element fails to render.


## Entry 006 — Weather Display Refinement
Date: 2026-07-23
Version: 0.2.6-dev

### Objective
Make the weather display read as a live satellite composite rather than a collection of separate dashboard panels.

### Implemented
- Full-height central terrain composite
- Subtle independent storm movement over fixed terrain
- Slow blinking triangular location markers
- Combined projected-track and observations legend
- Removed decorative circular pulse animation

### Design Decision
The terrain remains stable while only the storm layer moves. Animation is restrained so the screen remains readable and does not resemble a stylized radar sweep.

## Entry — v0.3.0-dev Weather Layout Sandbox
Created an in-browser tuning tool to replace the slow rebuild cycle. The current composite remains a temporary reference asset; crop, column widths, and marker alignment can now be adjusted live and copied as JSON.


## Entry — v0.3.7-dev
Built the second-stage Weather Development Tool. The approved screen layout is now the default. All code-rendered map elements and storm-layer animation can be positioned and tuned live without rebuilding the application.


## v0.3.7-dev — Weather Viewport Diagnosis
The map assets were valid and correctly packaged. The blank panel was caused by `.radar-map` being changed from an absolute, full-panel viewport to a relatively positioned element with only absolutely positioned children, collapsing its computed height to zero. The viewport is now explicitly anchored to all four edges of `.weather-radar-panel` with 100% width and height.


## Weather Layout Approval — v0.3.7-dev
The user-approved sandbox values were locked as the default weather-map configuration. The weather terminal was simplified to reflect a newly restored system: historical system-log chatter was removed and replaced with a single power-restored timestamp. Right-column hierarchy, communications states, impact probabilities, advisory typography, composite labeling, and corporate emblem presentation were refined.


## Entry — v0.3.7-dev startup repair
The v0.3.5 build contained a structural JavaScript regression: terminal profiles were accidentally inserted inside the Command section registry, leaving `profiles` undefined at runtime. The command registry and terminal profile registry were restored and browser-tested before packaging.


## Entry — v0.3.7-dev Command Interaction Pass
- Adopted a one-palette-per-terminal rule; Command now uses green CRT shades only.
- Replaced duplicate left-side module navigation with Return to Systems on subsystem pages.
- Made the entire weather alert panel interactive and keyboard accessible.
- Reworked storm animation into a seamless continuous rotation with live 10–600 second developer control.
- Preserved independent marker blinking and the approved weather map layout.
## v0.5.11-dev — Communications Refinement and Diagnostic

- Added a Communications-specific typography drawer governed by the existing Warden developer-controls preference.
- Added live font variables for summary, list, detail, metadata, body, controls, and footer text with source-baked defaults and copyable JSON output.
- Kept Corporate Directive links inside Communications by reusing the existing directive document, lock, password, and hidden three-second hack components in a dismissible overlay.
- Separated the unknown Relay 04 capture from Dr. Hinton's later commissary PA playback request so the archive now presents a neutral intercept followed by a deliberate local system action.
- Generated a normalized 180-column peak envelope from the approved V3 WAV and connected the played waveform, playhead, progress rail, and elapsed-time display to the same audio clock.
- Replaced the overly interpretive commissary-event emergency copy with an automated report manually initiated from Dr. Claire Edem's private terminal and queued for automatic retry.
- Added a compact top-row diagnostic alert and modal report describing the mismatch between Category IV atmospheric attenuation and complete orbital-uplink failure.
- Preserved all previous terminal, weather, beacon, Directive 015 security, logo, and offline behavior.
## v0.5.12-dev — Communications Typography Lock and Playback Readiness

- Promoted the user-approved Communications typography JSON to the v2 source defaults.
- Added a persistent warmup audio object when Communications opens and changed the visible player to `preload="auto"`.
- Added load, data-ready, can-play, waiting, stalled, playing, pause, end, and error handling so the status label reflects actual media readiness.
- Added a retry path and separate blocked-playback language while preserving user-gesture playback requirements.
- Replaced the corporate SVG contents with the supplied transparent symbol-only artwork while retaining the established asset path across all interface references.
- Increased the date and status tracks in the Transmission Log, rebalanced the list/detail split, and kept record dates, titles, and statuses on one line where space permits.
- Removed the 850-pixel paragraph cap responsible for premature wrapping and protected signal routes and inline actions from unnecessary breaks.

## v0.5.13-dev — Communications Diagnostic Scale Pass

- Reworked the Communications Diagnostic as a 1,400-pixel wide-format exception report at the reference display size.
- Increased every diagnostic text tier in proportion to the approved Communications typography, including the 43–61% expected loss and 100% observed loss values.
- Added more deliberate internal spacing and a vertically centered findings block so the expanded report reads as an important technical alert rather than a small utility dialog.
- Retained its existing comparison language, overlay dismissal, Communications context, and all prior application behavior.

## v0.5.14-dev — Startup Signal Preload

- Added a startup fetch for the approved 2.2 MB archived-signal WAV so its transfer begins before Communications is opened.
- Converted the completed response into a session-lived object URL shared by every rendered signal player, eliminating repeat file transfers between archive views.
- Added safe attachment logic that upgrades an idle player when preloading completes but never replaces audio that is already playing or has progressed.
- Kept the original packaged asset as the fallback source for browsers or file-launch modes that reject the startup fetch.

## v0.5.15-dev — Facility Management Foundation

- Replaced the Command Terminal's Base & Infrastructure placeholder with a Facility Management comparison and Horizon-specific records hub.
- Built separate telemetry timing models: Horizon values drift from the local facility bus, while Heron values update with the automated 30-second distress-carrier packet.
- Implemented Horizon and Heron condition assessments without confirming survivors or exposing unavailable Heron controls.
- Rebuilt the Horizon personnel organization as live HTML from a 25-person roster rather than using the old static chart image.
- Added a separate biosignal monitor protected by Dr. Edem's `51895` executive code. It reports signal state only and never exposes a personnel location.
- Added the supplied map exports unchanged in a layered interactive viewport. Room polygons provide touch-friendly selection while the floorplan, system elements, and maintenance routes remain independent layers.
- Added drag/pan, pinch and wheel zoom, zoom controls, selected-room highlighting, and a right-side neutral room information panel.
- Added a player-facing `VIEW MAINTENANCE SCHEMATICS` control protected by Demar's code, `12345`. The Illustrator master remains the artwork source of truth and is not bundled as a runtime asset.
- Added vehicle status and dispatch records, including APC-02 charging at Horizon and the unconfirmed Heron-bound evacuation manifest.
- Added a Work Order Archive with at-a-glance OPEN/CLOSED status and restrained summaries for ordinary records so they do not create unintended story clues.
- Added Heron Station's Reactor Thermal Advisory as passive telemetry received over the distress carrier, including the 18% cooling-water intake loss and unanswered engineering request.

## v0.5.16-dev — Facility Management Refinement

- Added startup image preloading for both Weather composite layers and corrected Weather title alignment and terminal-palette inheritance.
- Corrected the Distress Beacon chronology to July 18, 2122 and advanced the retransmission estimate to match the revised three-month broadcast window.
- Rebalanced Communications toward the detail pane without changing its record structure or archived signal behavior.
- Reorganized Facility Comparison so live telemetry establishes context before the two facility cards; added clearer station actions, contextual backgrounds, increased separation, and direct reactor-advisory access.
- Replaced top-level Facility back controls with contextual left-rail navigation and restyled the Horizon module launcher as compact, centered schematic tiles.
- Refined the interactive schematic with a faint grid, brighter floorplan labels, and a solid selected-room treatment while preserving pan, zoom, layered SVG architecture, and untouched exported artwork.
- Standardized the code-rendered personnel directory and biosignal monitor against the approved 25-person roster, including distinct Dr. Edem and 2LT Kaplan hierarchy cards and neutral SGT Valdez labeling.
- Added hidden three-second emblem-hold Warden bypasses to both Facility security screens without exposing player-facing hints.
- Added a Facility typography development tool governed by the existing Warden visibility setting, with live grouped controls, persistence, reset, and copied JSON output.
- Improved vehicle, work-order, and biosignal layouts, including vertical fleet records and separately aligned life-state and range-at-loss data.
- Added a portable text roster at `docs/ETOS_Personnel_Roster.txt`.

## v0.5.17-dev — Facility Layout and Navigation Pass

- Reorganized the Horizon local-systems screen into a left-weighted operational column with vertically stacked module buttons and a two-by-two live telemetry block.
- Used the open right side for a deliberately subdued Ellison-Tanaka identity field with the corporate slogan and a static scan interruption.
- Established a consistent Command rail hierarchy: contextual Facility back controls remain near the active module, while Return to Systems now occupies the bottom main-menu position.
- Added faint schematic grids to both personnel branches and increased the size and typographic hierarchy of the Edem and Kaplan command cards.
- Increased vehicle Dispatch History and Work Order History typography as baked source defaults.
- Corrected the final odd biosignal record so PFC Weaver remains aligned to the same half-width grid as every other record.
- Removed animation from selected map rooms while retaining the approved translucent fill, outline, and static glow.


## v0.5.18-dev — Horizon Base Brand Scale
- Removed the center divider overlay from the Horizon Base corporate brand panel.
- Increased emblem and wordmark scale for stronger visual presence.

### 0.5.23-dev schematic interaction hotfix
The 0.5.20 package retained 0.5.18 cache-busting query strings and an internal 0.5.19 JavaScript version. This could cause browsers to combine old and new assets. All asset query versions were advanced, control layering was reinforced, SVG initialization now tolerates individual overlay failures, and camera destination math was corrected.

### 0.5.24-dev schematic controls
Added controlled-door hatching, numeric alert positioning, reduced alert icon scale, and corrected alert target camera coordinates.

### 0.5.28-dev schematic bounds and door hatching
Restored explicit SVG hatch fills for controllable doors and clamped all camera transforms to the schematic viewport.
# v0.5.33-dev — Horizon Base Medical Terminal

The Medical terminal placeholder is now a compact three-region scientific workstation. Five active modules share a persistent center preview and laboratory status rail, while four dim general medical entries remain inert and non-focusable. The supplied scans and specimen imagery remain unchanged source assets; monochrome CRT treatment, grids, labels, assay regions, and measurement markers are rendered in CSS and HTML.

The completed genomic run begins unread and requires a deliberate player action before a 2.6-second comparison sequence reveals NF-06 as the hostile specimen's primary genetic match. The report establishes extensive carcinid restructuring while leaving the causative mechanism undetermined. Two sealed live-specimen vials use independent local session state and require explicit confirmation before their laboratory retention locks disengage. Release never opens a vial or controls the nearby transport case.
# v0.5.34-dev — Medical Terminal Targeted Patch

The existing Medical Terminal was patched without changing its shared shell or other ETOS profiles. Containment now migrates existing session data forward by preserving Vial 01 and 02 states and initializing Vial 03 as secured. Each supplied vial image is displayed in the active containment record, each individual retention-release control sits beside its status, and one confirmation can release every vial that remains secured.

Genomic Analysis is now a sixth primary Medical module. Its original timestamps, unread state, and first-open staging remain intact. The completed sequence and NF-06 result appear in a dismissible overlay over the two persistent organism images; the overlay can be reopened immediately without replaying the initial loading animation. The NF-06 record now explains its K-17 field-survey relevance, and the renamed Shriek Response Study begins with the controlled vocalization experiment protocol before its physiological findings.
# v0.5.35-dev — Medical Containment Authorization

Specimen-vial retention release now passes through a Medical-specific authorization state that reuses ETOS's established Command security presentation. Individual and bulk actions both require Dr. Claire Edem's password before reaching their existing confirmation and release sequences. The hidden corporate-seal hold uses the shared three-second duration and existing four-stage hack animation, then returns to the pending confirmation without revealing the credential.

The genomic-analysis history now distinguishes authorization from review. Dr. Claire Edem authorized sequencing at 07/18/2122 09:42, sequencing completed at 07/19/2122 03:16, and the review record remained empty when players first opened the result. The same facts remain in a secondary footer after the NF-06 reveal.
