# v0.5.79-dev — Argoza portrait and map annotation cleanup

- Added the supplied Fritigern portrait to his existing Away Team card through the shared crew portrait renderer.
- Removed the River System and Reservoir decorative overlays from the Horizon Sector map.
- Preserved the map artwork, marker configuration, navigation, developer controls, and unrelated terminal behavior.

# v0.5.78-dev — Argoza Personnel Manifest readability

- Replaced the simultaneous Support/Military manifest columns with two large same-panel roster selectors.
- Defaulted each Personnel Manifest opening to Support and retained the existing names, roles, hierarchy, and formatting.
- Increased subgroup prominence and breathing room while presenting personnel as readable single roster rows.
- Made developer visibility Warden-authorized for the current runtime only, guaranteeing hidden tools on initial load and refresh.
- Preserved direct Argoza initialization, Warden-gated terminal switching, map behavior, and unrelated ETOS systems.

# v0.5.77-dev — Final planetary marker defaults

- Updated the five System, Orison, and Horizon Sector marker defaults to their finalized X/Y/scale values.
- Advanced only the planetary-marker preference key so prior development overrides cannot mask the committed defaults.
- Preserved normalized positioning/sizing, developer controls, navigation, artwork, labels, animations, and pan/zoom behavior.

# v0.5.76-dev — Map-relative marker sizing

- Replaced fixed-pixel planetary marker dimensions with artwork-width percentages calibrated to the landscape-iPad presentation.
- Retained each stored developer `scale` value as a centered multiplier over the normalized base size.
- Added artwork-container-relative label spacing with readable typography clamps.
- Preserved marker coordinates, navigation, animations, developer controls, and Horizon Base pan/zoom interactions.

# v0.5.75-dev — Artwork-anchored map markers

- Anchored planetary marker X/Y values to the marker icon rather than the marker-plus-label box.
- Made each fitted overlay follow the map image's intrinsic aspect ratio and exact rendered bounds.
- Preserved one normalized coordinate set, developer controls, hierarchy navigation, and Horizon Base shared pan/zoom behavior.
- Added an explicit latest-build refresh path that retires stale ETOS workers and caches before a versioned reload.

# v0.5.74-dev — iPad-first Command overview

- Replaced the player-facing absolute-positioned Command dashboard with a landscape-tablet CSS Grid.
- Preserved the Orison, Beacon, Weather, Directive, Communications, Planetary Conditions, and Facility Management hierarchy while containing every panel inside the available terminal viewport.
- Added tablet-responsive card typography and compact panel internals without scaling the complete dashboard.
- Kept the Warden live layout editor available as a separate explicit editing mode.

# v0.5.73-dev — Responsive map coordinate spaces

- Anchored Argoza System, Orison, Horizon Sector, and Horizon Base overlays to fitted source-art bounds.
- Applied the same fitted-artwork coordinate model to Command weather terrain, storm, coded sites, labels, forecast path, and scale overlays.
- Preserved all normalized marker and room coordinates while removing aspect-ratio-dependent crop and letterbox drift.
- Kept Horizon Base artwork and room hotspots inside the same pan/zoom transform layer.

# v0.5.72-dev — Sanitization alarm phases

- Limited the initial post-activation facility alarm to 15 seconds with a 350 ms fade while leaving sanitization active.
- Added a Warden-only `MUTE FACILITY ALARM` control that affects audio only.
- Made every reusable Warden final countdown restart or retain the facility alarm, duck it beneath each number, and fade it 1.5 seconds after `ONE`.
- Removed active-state rerender paths that could unintentionally restart a completed or muted facility alarm.

# v0.5.71-dev — Runtime URL diagnostics

- Resolved sanitization WAV URLs relative to the successfully loaded `audio.js` runtime URL instead of `document.baseURI`.
- Added Warden-visible app version, origin, pathname, resolved URL, HTTP, MIME, byte-count, decode, and specific failure diagnostics.
- Disabled each direct test until its corresponding runtime fetch and decode reports `READY`.

# v0.5.70-dev — Sanitization runtime direct-output diagnostic

- Anchored the first warning pulse to the exact Command Key `ENGAGED` state transition and retained the escalating scheduler.
- Routed warning and facility WAV sources directly to `AudioContext.destination` at gain `1.0` for desktop-runtime diagnosis.
- Added exact workflow, source-start, speech-completion, cleanup, and complete gain-chain logging while retaining Warden tests.

# v0.5.69-dev — Sanitization WAV asset-pipeline diagnostics

- Verified both supplied sanitization WAVs are present in the repository and byte-identical to their supplied source files.
- Reworked the shared decoded-WAV loader to validate HTTP status, MIME type, response length, RIFF/WAVE signatures, and decoded duration with retryable per-asset state.
- Added Warden asset status indicators and direct-test refetches, plus new build/asset cache keys to bypass stale iPad responses.

# v0.5.68-dev — Medical media flow and biometric scanner audio

- Added equal-width Recommended Procedure cells and a final irreversible sanitization warning before Data Module authentication.
- Returned completed duplication and sanitization operations to Media Service with persistent protocol-card status.
- Added a dedicated cancellable biometric contact hum, scan-synchronized sweep/ticks, and single verification chirp without reusing Data Module sounds.

# v0.5.67-dev — Case-insensitive personnel access

- Normalized Personnel Briefing access codes to uppercase before validation.
- Preserved the visible, unmasked access-code field and all existing briefing behavior.

# v0.5.66-dev — Personnel Briefings location correction

- Moved Personnel Briefings from Mission to the existing Argoza Briefing Files browser.
- Added Personnel Briefings as the sixth native file row.
- Updated access-screen back navigation to restore the existing Briefing Files page.
- Preserved all personnel codes, document content, layouts, and document-to-access navigation.

# v0.5.65-dev — Argoza Personnel Briefings

- Added a restricted Personnel Briefings entry to the Argoza Mission area.
- Added four exact, case-sensitive assignment access codes and data-driven personnel documents.
- Added Argoza-native document, clearance, issued-equipment, accountability, and restricted-footer presentation.
- Added direct back navigation to the clean access-code screen without completion or persistence state.

# v0.5.64-dev — Sanitization audio output diagnostics

- Added Warden-only direct tests for the warning pulse and facility alarm.
- Routed sanitization WAV playback through a dedicated full-level bus while preserving the ETOS master volume.
- Added asset URL, decode, play-request, playback-start, completion, and rejection diagnostics.
- Preserved the existing selected-delay voice announcement and Warden final-countdown behavior.

# v0.5.63-dev — Sanitization audio loading correction

- Bound Facility Sanitization to the supplied WAV filenames with explicit preload, decode, playback, and failure diagnostics; removed the legacy synthesized warning fallback.
- Delayed the single looping facility alarm until the initial selected-delay announcement completes, while retaining Safari-safe AudioContext preparation on Command Key and activation gestures.
- Made the Warden ten-second spoken cue reusable after each completed run while continuing to block overlapping countdowns.

# v0.5.62-dev — Warden-controlled sanitization countdown audio

- Added the supplied local warning pulse and looping facility emergency alarm to the Facility Sanitization audio sequence.
- Kept the selected-delay activation announcement, with no automatic spoken milestones after activation.
- Added a one-use Warden final-ten countdown with alarm ducking beneath each spoken number and reset support through the existing Command sequence reset.

# v0.5.61-dev — Audit Token visual and voice refinement

- Re-centered the two-row 8/7 Audit Token pin field with even spacing and a regular half-pitch stagger.
- Deepened and slowed all Audit Token system speech while preserving clear corporate/mainframe delivery.

# v0.5.60-dev — Command Audit Token protocol

- Added the persistent CRT-green Audit Token D-sub port to every Horizon Base Command screen.
- Added device verification, voice authorization, three-attempt retry behavior, manual passcode fallback, and incident-data acquisition flow.
- Added a universal Audit Token abort path that stops microphone/audio activity, clears the session, simulates token removal, and requires a new three-second insertion hold.
- Extended the Warden Command sequence reset to clear Audit Token state.

# v0.5.59-dev — Medical injector threshold flow and sequence resets

- Removed the redundant compound-reservoir hold screen from the Medical Auto-Injector workflow.
- Made the physical Auto-Injector port and biometric scanner advance immediately at their hold thresholds.
- Added Warden-only, sequence-scoped reset controls for Command sanitization and Medical genomic, vial, data-module, and Auto-Injector testing.

# v0.5.58-dev — Medical hardware interaction corrections

- Stabilized Media Service typography and reserved a fixed five-row progress window for duplication and sanitization.
- Changed the DATA MODULE hold to activate at the three-second threshold, with LED-only feedback and no visible hold instruction.
- Rebuilt the injector and fingerprint targets as stationary localized hardware controls.
- Added confirmed-only bulk vial termination and automatic return to viable-vial selection after injection results.

# v0.5.57-dev — Medical physical media and auto-injector controls

- Added the persistent Medical DATA MODULE receptacle, Media Service, research duplication, and secure local sanitization workflows.
- Added sanitized-record gating while preserving Medical navigation, vial retention/release controls, and the existing authorization path.
- Added the Specimen Containment auto-injector reservoir, biometric presence check, viable-vial targeting, and persistent per-vial termination state.
- Added restrained removable-media, fingerprint scan, and injector audio feedback using the existing Web Audio system.

# v0.5.56-dev — Compact Organization Directory header

- Placed the left-aligned Biosignal Tracker and right-aligned Organization Directory title in the same header row.
- Removed the extra header row and its unnecessary vertical gap without changing the tracker action or directory content.

# v0.5.55-dev — Organization Directory biosignal control

- Moved the Organization Directory biosignal control from the right side of its header to the reserved left-side Facility Management position.
- Renamed the control to `BIOSIGNAL TRACKER MONITOR`, including its restricted state, without changing monitor access behavior.

# v0.5.54-dev — Resumable Sanitization authorization

- Changed the final irreversible Sanitization action to activate immediately with one `PROCEED WITH SANITIZATION` click.
- Changed pre-execution abort into a paused engaged-key session that preserves authentication stage and valid delay information.
- Added tap-to-resume behavior for an already-engaged Command Key, including restoration of the appropriate warning cadence.
- Kept physical key removal as the full reset boundary for authorization and delay progress.

# v0.5.53-dev — Sanitization abort and reversible Command Key

- Added `ABORT PROTOCOL` throughout every pre-execution Sanitization screen; aborting clears the attempt and local warning while leaving the engaged key unchanged.
- Added the hidden three-second reverse interlock hold, release-triggered 1.5-second pause, and 1.05-second counterclockwise key-removal animation.
- Made pre-execution key removal close and clear the Sanitization workflow without creating an abort path after execution.
- Replaced the light warning chirp with a layered low-frequency two-part industrial buzzer while preserving the established escalation cadences.

# v0.5.52-dev — Escalating Sanitization warning audio

- Added a single stage-aware pre-execution warning controller with 2.75 s, 1.65 s, 1.0 s, and 0.525 s pulse cadences.
- Added a short synthesized CRT warning chirp and made cadence, rather than volume, the primary escalation cue.
- Unlocks Web Audio from the initial Command Key press so the acknowledgment and key-engaged warning are reliable on touch devices.
- Stops the authorization chirp immediately when the irreversible countdown begins.

# v0.5.51-dev — Warden Sanitization display control

- Added an authenticated Warden control for hiding and reopening the active or executed Facility Sanitization display without changing the irreversible sequence state.
- Raised the Warden control layer above the Sanitization presentation so authorized controls remain reachable.
- Corrected the Facility Sanitization authorization credential.

# v0.5.50-dev — Command interlock refinement

- Fixed the Command Key hardware geometry so transient status messages cannot move the tumbler or its labels.
- Lengthened the visible 90-degree tumbler turn to 1.05 seconds and synchronized the lock sound with its completion.
- Assigned the Facility Sanitization Protocol its dedicated six-digit command authorization credential.
- Changed the timer action to `CONFIRM SELECTED DELAY`.

# v0.5.49-dev — Command Authority Interlock

- Added a persistent hardware-style Command Key receptacle to the shared Horizon Base Command rail.
- Added the concealed three-second interlock gesture, release-delayed mechanical engagement, secondary authorization, delay selection, final hold confirmation, and irreversible countdown.
- Persisted Command Key and sanitization sequence state across navigation and reloads.
- Added restrained escalating green CRT warnings and centralized interlock/sanitization audio cues.

# v0.5.48-dev — Centralized ETOS audio layer

- Added a dependency-free Web Audio manager with centralized master, ambient, UI, system, and mechanical gain buses.
- Added procedural equipment ambience, synthesized UI/security/process/data/hack/research sounds, and the supplied mechanical actuation/fault WAV assets.
- Wired semantic feedback across terminal navigation, transfers, authentication, hacks, the first genomic reveal, containment releases, facility doors, the garage fault, airlock cycling, and passive packets.
- Preserved archived communications playback as its existing independent HTML audio implementation.

# v0.5.47-dev — Darker Crew portrait phosphor balance

- Reduced shared Argoza Crew portrait brightness to 72%.
- Increased the restrained cyan frame wash from 12% to 14% to keep highlights pale blue rather than neutral white.
- Preserved the existing compact phosphor shadow without increasing glow.

# v0.5.46-dev — Crew portrait cyan CRT integration

- Added a restrained 12% cyan phosphor wash across the shared Argoza portrait frame.
- Added a compact 1.5px cyan drop-shadow at 18% alpha without inversion, masking, or tonal compression.
- Reused the terminal-wide CRT scanlines instead of stacking a second portrait scanline layer.

# v0.5.45-dev — Unified Crew portrait delivery

- Applied one shared portrait-image class and raw-rendering rule to both Away Team and Argoza Support cards.
- Added build-version query strings to all Crew portrait URLs so replacement PNGs cannot be confused with an older cached asset at the same path.
- Kept Katya Kosmonavt and Dr. Alaric Fritigern on their existing placeholders because no matching portrait assets are present.

# v0.5.44-dev — Raw Crew portrait restoration

- Forced Crew portrait images to render with no filter, mask, opacity reduction, or non-normal blending.
- Disabled portrait-frame pseudo-elements that could replace or overlay the source artwork.
- Moved the extremely faint cyan CRT integration effect to the frame shadow rather than the image pixels.

# v0.5.43-dev — Restrained Crew CRT integration

- Preserved the updated Crew PNGs as-authored with opaque white interiors, black linework, and transparent exterior pixels.
- Added only a one-pixel, low-opacity cyan drop shadow for subtle Argoza CRT integration.
- Kept all masking, inversion, full-image tinting, opacity reduction, and non-normal blending removed.

# v0.5.42-dev — Native Crew portrait rendering

- Confirmed the four Crew records reference `maas.png`, `anders.png`, `renfield.png`, and `phalange.png`.
- Removed portrait-specific masking and tint processing so the updated transparent PNG assets render normally.
- Retained consistent contain-style sizing and existing terminal-level CRT presentation.

# v0.5.41-dev — Argoza cyan consistency pass

- Normalized Argoza primary and secondary text colors to a cyan CRT hierarchy across every Argoza section.
- Replaced Crew portrait inversion/filter processing with alpha-mask tinting that preserves source transparency.
- Left all portrait PNG source assets unchanged.

# v0.5.40-dev — Argoza v15 final polish

- Promoted the Home arrival countdown to a full-width primary banner while preserving the approved 2122 target display and destination treatment.
- Stabilized Mission objective scrolling during the retained staggered reveal.
- Enlarged selected Crew cards and portraits and simplified portrait coloration to clean cyan linework.
- Hardened all nine generic Planetary facility hotspots against drag-state click suppression.
- Installed the five approved final Planetary marker defaults while retaining Warden developer adjustment and export controls.

# v0.5.39-dev — Argoza v14 finalized revision

- Finalized the noon arrival target and fictional 2122 player-facing target line.
- Removed the standalone Argoza Communications tab while retaining its mission and briefing context.
- Added the finalized What We Know summary, objective order, sequential load animation, and destination branding.
- Rebuilt Crew as a selected-team workspace with a right-side vertical cryogenic roster and four approved transparent portraits.
- Expanded Planetary marker tools to five markers with X/Y/Scale editing and selectable/copyable exports.
- Split the shared Horizon Base map into generic Planetary orientation and mission-specific Briefing modes.
- Updated Personnel Manifest name formatting, header hierarchy, and lost-signal status line.

# v0.5.38-dev — Argoza v11 targeted revision

- Enlarged Argoza typography and converted Home into a shipboard status dashboard without duplicate navigation controls.
- Replaced the sparse Mission cards with readable objective lists and faint Ellison-Tanaka document branding.
- Enabled bidirectional Planetary breadcrumbs and added persistent X/Y developer controls for all three navigation hotspots.
- Added restrained hotspot pulses and corrected the shared Horizon Base map with smooth room focus, bounded pan/zoom, and touch pinch-to-zoom.
- Removed duplicate generated room labels, reordered Briefing Files, and rebuilt the manifest as SUPPORT / MILITARY with the approved hierarchy and roles.

# v0.5.37-dev — ETV Argoza Player Terminal

- Replaced the Argoza placeholder with the complete player-facing mission, crew, planetary, briefing, and communications workstation.
- Routed first initialization directly to Argoza while preserving Warden-gated switching to Horizon terminals.
- Added a centralized arrival countdown, four-level planetary drill-down using the supplied orbital and Orison assets, and one shared clean facility-orientation map for Planetary and Briefing Files.
- Added the approved away team, support crew, 15-berth cryogenic panel, six-objective directive, 25-person Horizon manifest, and spoiler-safe mission-network reference.

# v0.5.36-dev — Dr. Claire Edem Personal Terminal

- Replaced the Edem placeholder with a data-driven amber-phosphor personal workstation inside the existing ETOS shell.
- Added the approved Mission Log, Research Notes, Personal Journal local cache, remote-archive unavailable state, and direct-opening failed Outbox message.
- Integrated the existing Ellison-Tanaka branding and `grid_contour_map.svg` as non-interactive low-opacity amber decoration.
- Preserved terminal switching, CRT effects, Warden/dev infrastructure, Medical authorization, Command systems, and the unprotected Journal requirement.

# v0.5.35-dev — Medical Containment Authorization

- Added Dr. Claire Edem password authorization to individual and bulk specimen-vial retention release.
- Reused the existing Command security seal, three-second hold, hack animation classes, and timing for a hidden Medical authorization bypass.
- Kept incorrect-password feedback neutral and prevented the authorization password from appearing in the interface.
- Added Dr. Edem's sequencing authorization to the unread genomic log and preserved it as secondary post-reveal history without implying she reviewed the result.

# v0.5.34-dev — Medical Terminal Targeted Containment and Research Patch

- Expanded specimen containment from two vials to three using the supplied `vial1.png`, `vial2.png`, and `vial3.png` assets.
- Moved each individual release control directly below its vial status and added one confirmed release-all action for all remaining secured vials.
- Promoted Genomic Analysis to its own primary module below Specimen Containment and removed it from the Specimen Analysis tabs.
- Preserved the first-time staged genomic reveal while adding a dismissible completed comparison overlay and immediate reopen control.
- Added K-17 survey context to the NF-06 baseline record.
- Renamed Signal Exposure to Shriek Response Study and added the controlled-vocalization experiment summary.

# v0.5.33-dev — Horizon Base Medical Terminal

- Replaced the Medical placeholder with a persistent three-region clinical workstation using the white monochrome CRT palette.
- Added focused Signal Exposure, Specimen Analysis, Personnel Scans, and Specimen Containment evidence modules using the supplied source imagery with code-rendered overlays.
- Added the deliberate unread genomic comparison reveal identifying the hostile specimen as transformed NF-06 without assigning a causative mechanism.
- Added independently persistent release controls for two sealed live-specimen vials, including confirmation and short lock-disengagement sequences.
- Added the NF-06 baseline record, hydrofluoric-acid carapace assay, LCPL Talia Resnick scan findings, and Sample H-17 chain-of-custody record.
- Preserved Command, Dr. Edem, Argoza, terminal transfer, Warden controls, global CRT behavior, and supplied image assets.

## v0.5.32-dev
- Fixed controlled-door hatch by restoring SVG pattern child visibility.
- Forced room-label vector paths to CRT green at source and CSS levels.

- Fixed stale command-theme cache version that prevented recent schematic styling from loading.
- Baked CRT-green room-label fills and diagonal controlled-door hatching directly into the embedded SVG markup and source assets.
- Forced room-label vector paths to CRT green and replaced fragile CSS-only door hatching with an SVG-native high-contrast stripe pattern.
# ETOS v0.5.28-dev

- Restored visible diagonal hatch stripes on all player-controlled doors.
- Added hard pan boundaries so the schematic cannot be dragged into empty black space.
- Applied the same bounds after manual pan, pinch/wheel zoom, buttons, reset, and automatic target navigation.

# ETOS v0.5.26-dev

- Corrected room and door alert camera targeting while preserving icon targeting.
- Baked default alert icon coordinates: weather 184/242; structural impact 85/99.
- Icon developer controls now render only when Warden developer controls are enabled.
- Restored command/facility interface text to monochrome CRT green.

# v0.5.18-dev

- Removed the decorative horizontal divider that crossed the Ellison–Tanaka logo on the Horizon Base facility panel.
- Enlarged the Horizon Base corporate emblem and accompanying wordmark while preserving the existing low-opacity CRT treatment.

# v0.5.17-dev

- Rebuilt the Horizon Facility Management home screen with all four module controls in one left-side column.
- Arranged Horizon telemetry as Reactor/Life Support above Water Recovery/Power Reserve.
- Added a subdued Ellison-Tanaka emblem, slogan, grid field, and static scan interruption to the right side of the Horizon home screen.
- Moved the Command Overview return control to the bottom of subsystem rails and retained contextual Facility back controls near the active module.
- Added faint grids behind both Organizational Directory branches and enlarged the Dr. Claire Edem and 2LT Aaron Kaplan leadership cards.
- Increased Dispatch History and Work Order History date, title, and status typography without adding new developer controls.
- Prevented the final odd biosignal record from spanning the full monitor width.
- Removed the selected-room pulse while retaining its translucent fill, bright outline, and static glow.

# v0.5.16-dev

- Began preloading the Weather terrain and storm layers at ETOS startup, centered the Weather title, and restored the full Weather interface to Command-green CRT tones.
- Corrected the Distress Beacon first-detected date to `2122.07.18` and adjusted its initial retransmission estimate to approximately 83,520 broadcasts.
- Narrowed the Communications history column to provide more room for the selected-record reading view.
- Refined the Facility Management comparison with live telemetry above the station cards, clearer station controls, more breathing room, distinctive background treatments, and direct access to Heron's passive reactor advisory.
- Moved Facility navigation into the left rail, refined the Horizon module tiles and schematic viewport, increased room-label visibility, and replaced the beaded room selection with a solid animated glow.
- Reworked vehicle, work-order, organization, and biosignal layouts for clearer hierarchy and scanning.
- Added distinct lead cards for Dr. Claire Edem and 2LT Aaron Kaplan, removed the acting-commander disclosure from SGT Sofia Valdez, and standardized all 25 roster and biosignal names.
- Added hidden three-second emblem holds to the biosignal and maintenance authorization screens, matching the existing Warden-controlled Directive bypass.
- Added a Warden-controlled Facility Management typography tool with live controls, save, reset, and copyable settings.
- Added `docs/ETOS_Personnel_Roster.txt` as a portable canonical roster reference.

# v0.5.15-dev

- Renamed the Command Overview Base & Infrastructure subsystem to Facility Management.
- Added a two-facility landing screen comparing Horizon Base local telemetry with Heron Station distress-carrier telemetry.
- Added gently drifting live infrastructure values with distinct near-failure Horizon ranges and stronger Heron ranges.
- Added the Horizon Facility Management landing page with a 25-person code-rendered organization directory, protected biosignal list, interactive facility schematic, vehicle log, and work-order archive.
- Added biosignal states for current local readings, five lost signals, and eighteen alive-at-last-contact signals now outside the local network's range; location data remains unavailable.
- Integrated the supplied floorplan, room-hitbox, system-element, and maintenance SVG exports as untouched stacked layers with tap selection, room details, drag/pan, pinch/wheel zoom, and map controls.
- Added password `12345` to the player-facing maintenance schematic overlay and retained `51895` for executive biosignal access.
- Added passive Heron telemetry and the Reactor Thermal Advisory without exposing remote controls or implying a successful handshake.
- Added APC/ATV inventory and dispatch history, including the July 18 evacuation departure and unconfirmed arrival.
- Added a compact Work Order Archive with visible OPEN/CLOSED states, neutral archived summaries, routine airlock service, and retained Hinton-related requests.
- Updated legacy personnel and operations entry points so they no longer expose obsolete counts or bypass protected maintenance schematics.
- Preserved Communications, archived-signal preload, directives, weather, Warden controls, terminal transitions, and offline/local-server behavior.

# v0.5.14-dev

- Began loading the archived V3 signal during ETOS startup instead of waiting for the Communications panel to open.
- Retained the completed WAV as a session-wide in-memory object so repeated archive views reuse the same fully loaded audio data.
- Added automatic handoff from a still-loading player to the preloaded copy without interrupting an active or partially played signal.
- Preserved the packaged WAV as a direct-playback fallback if browser security or file-launch restrictions prevent the preload request.
- Preserved all v0.5.13 Communications, diagnostic, directive, logo, terminal, and offline/local-server behavior.

# v0.5.13-dev

- Enlarged the Communications Diagnostic report from a compact modal to a wide-format technical display roughly twice its previous width.
- Increased its heading, metric, result, explanatory, control, and footer typography to match the approved Communications scale.
- Expanded spacing and emphasized the expected-versus-observed signal-loss comparison while preserving its content and click-outside dismissal.
- Preserved all v0.5.12 Communications typography, playback-readiness, logo, wrapping, terminal, and offline behavior.

# v0.5.12-dev

- Baked the approved Communications typography values into a new source-default settings revision.
- Added automatic signal preloading, warm-cache preparation, and explicit loading, buffering, playing, failure, and retry states to improve first-attempt playback reliability.
- Replaced the text-bearing Ellison-Tanaka SVG with the supplied transparent symbol-only mark everywhere the interface uses the corporate icon.
- Widened the Transmission Log date and status columns and prevented unnecessary wrapping in date, title, status, signal-route, action-link, and applicable message-copy elements.
- Rebalanced the Communications list/detail columns and removed the fixed message-paragraph width that caused copy to wrap before reaching its panel edge.
- Preserved all v0.5.11 Communications content, directive overlays, diagnostic, real waveform, security controls, and offline behavior.

# v0.5.11-dev

- Added a Warden-controlled Communications Typography tool with live grouped font controls, local persistence, reset, and copyable JSON settings.
- Changed Communications directive links to open the existing directive documents, Directive 015 lock screen, and hidden hack flow as overlays without leaving Communications.
- Split the archived signal history into an automated Relay 04 intercept and a separate Dr. Hinton commissary PA playback request.
- Replaced the decorative waveform with 180 peak samples calculated from the approved 11.5-second V3 audio and synchronized its illuminated progress and playhead to actual playback time.
- Rewrote the Horizon Base emergency report as a standardized notification manually initiated from Dr. Claire Edem's private terminal and retained pending an orbital connection.
- Added a clickable Communications Diagnostic alert comparing expected Category IV atmospheric attenuation with complete observed orbital-uplink loss and broadband carrier contamination.
- Increased the baked-in Communications typography defaults while preserving the Warden visibility toggle and all prior terminal systems.

# v0.5.10-dev

- Replaced the Communications placeholder with a compact transmission-history and selected-message interface.
- Added the approved mission chronology from December 2121 through the interrupted Horizon Base emergency report on July 18, 2122.
- Distinguished passive telemetry reception from the loss of two-way Orbital Relay contact.
- Added secure links from Communications records to Directives 014 and 015 without bypassing Directive 015 authentication.
- Added a separate archived-signal record with the approved V3 organic insect scream, custom waveform, playback progress, elapsed time, and play/pause controls.
- Updated the Command Overview Communications tile to show lost two-way contact and two queued outgoing messages.
- Replaced every visible corporate logo and emblem reference with the supplied transparent SVG.
- Preserved the Directive 015 password, hidden Warden hack, distress-beacon monitor, weather system, developer tools, terminal switching, and source-baked Command Overview defaults.

# v0.5.9-dev

- Replaced the Distress Beacon folder navigation with a single modal-style carrier-details popup.
- Added authenticated Heron Station identification, first-detection date, signal integrity, reception quality, and station telemetry.
- Added a live 30-second automatic broadcast cycle with a once-per-second countdown and continuously draining progress rail.
- Added a brief `TRANSMITTING…` phase that increments the retransmission count and resets the next cycle to `00:30`.
- Set the source-default retransmission count to approximately three months of 30-second broadcasts: `264,960`.
- Kept the monitor running while the popup is closed and omitted voice, audio, survivor identities, creature references, and definitive survivor status.

# v0.5.8-dev

- Moved the Directive 015 active marker into a dedicated centered column between the title and `PRIORITY // OMEGA`.
- Enlarged the marker text and touch-independent display area.
- Replaced its misplaced edge positioning with a steady on/off blink.
- Preserved the compact archive, document overlays, password access, and hidden Warden hack route.

# v0.5.7-dev

- Replaced the vertically stretched directive cards with a compact, centered archive index.
- Added a prominent incoming executive-directive notification for Directive 015.
- Added `NEW // ACTIVE` and active-directive states so Directive 015 is immediately distinguishable from archived orders.
- Changed directive documents, the Directive 015 password screen, and the hidden hack sequence to centered overlays that preserve archive context behind them.
- Retained all directive content, authorization code `51895`, the hidden three-second emblem hold, and session-only unlock behavior.

# v0.5.6-dev

- Replaced the Corporate Directive placeholder with an archive containing only Directives 001, 014, and 015.
- Added full terminal-rendered directive documents with consistent references to Dr. Claire Edem.
- Added executive password protection for Directive 015 using authorization code `51895`.
- Added an unmarked three-second Ellison-Tanaka emblem hold that triggers a four-second Warden-controlled security-bypass animation.
- Kept Directive 015 unlocked only for the current application session after successful password or hack access.
- Updated visible build labels and cache-busting asset versions while preserving the locked Command Overview defaults and developer tools.

# v0.5.5-dev

- Replaced the Command Overview panel defaults with the exact layout copied from the live editor.
- Preserved the approved typography and layout/animation defaults.
- Advanced overview storage keys to v7 and added a fresh migration marker so this build installs the new defaults once.
- Retained the visible repositioned Layout Editor toolbar and all developer controls.

# v0.5.4-dev

- Moved the live Layout Editor toolbar downward so it clears the terminal and module headers.
- Added viewport-safe width, height, and scrolling limits so all copy/reset controls remain visible.
- Advanced the locked-settings migration identifier for a clean test launch.

# v0.5.3-dev

- Reapplied approved Command Overview JSON using clean v6 storage keys.
- Added cache-busting asset URLs so old JavaScript and CSS cannot be reused.
- Moved Layout Editor controls to the top of the screen.
- Added clearly labeled panel-only and complete overview copy buttons.

## v0.5.2-dev — Locked Command Overview Baseline

- Baked the approved panel positions and dimensions into the source defaults.
- Baked the approved overview typography into the source defaults.
- Baked the approved layout, planet, moon, icon, pulse, and grid settings into the source defaults.
- Advanced overview storage keys so this test build loads the approved baseline in a fresh profile.
- Added `docs/command-overview-defaults.json` as a portable reference for future development.
- Retained all developer controls and the Warden visibility toggle.

## v0.4.9-dev — Developer Controls Hotfix

- Fixed Overview Typography controls not applying to the overview canvas.
- Fixed Layout Tools controls not applying spacing, columns, icon size, grid opacity, or animation values.
- Fixed planet animation toggle by applying its state to the correct overview element.
- Advanced the session key to avoid stale development-state collisions.

## v0.4.3-dev — Command Overview Typography Sandbox

### Added
- Live developer controls for each major text block on the Command System Overview.
- Locally saved and copyable typography settings.

### Changed
- Centered the primary weather alert and enlarged its hierarchy.
- Combined distress carrier and orbital anomaly messages onto single lines.


## v0.4.3-dev — Command Overview Redesign
- Rebuilt the Command landing page as a Corporate Tactical / Retro-Futurist operations console.
- Added a dominant whole-panel weather alert and functional panels for distress beacon, corporate directive, communications, and base/orbital status.
- Added shaped CRT framing, stronger visual hierarchy, passive status stack, and identity rail.
- Added dedicated detail screens and Return to Systems navigation.
- Added visible loading and error states for large document images.
# ETOS Changelog

## v0.3.7-dev — Command Navigation & Monochrome Alert

### Added
- Whole-panel weather alert touch target on Command System Overview
- Green-only critical alert treatment using brightness, pulse, and border rhythm
- Return to Systems control on detailed Command subsystem pages
- Wide-range storm rotation speed control (10–600 seconds)
- Pause and reverse storm rotation controls
- Recommended 240-second rotation reset

### Changed
- Unified the entire Command Terminal to the brighter Weather Surveillance green CRT palette
- Removed direct subsystem shortcuts from the left navigation rail
- Weather storm now rotates continuously without horizontal or vertical drift


## v0.3.7-dev — Weather Content & Layout Lock

### Added
- Approved weather-map and animation settings as the new defaults.
- Circular Ellison-Tanaka emblem asset for the weather header.
- Power-restored startup timestamp.

### Changed
- Moved system status and date/time panels into the right column.
- Removed the projected-track legend from the status panel and expanded Latest Observations.
- Set Horizon Base impact probability to 93% and Heron Station to 87%.
- Increased Weather Advisory and radar-composite label legibility.
- Changed Horizon Base communications to amber DEGRADED.
- Removed the nonexistent Deep Range Array.


## v0.3.7-dev — Weather Viewport Fix

### Fixed
- Restored the radar map viewport to fill the central weather panel.
- Terrain, storm, SVG overlays, labels, markers, and scale now render inside a correctly sized layer container.
- Retained the terrain CSS fallback and explicit layer stacking.


## v0.3.7-dev — Weather Layer Visibility Fix

### Fixed
- Forced terrain and storm layers to render as visible stacked layers.
- Added the terrain image as a CSS fallback background.
- Added explicit z-index ordering for terrain, storm, SVG overlays, labels, and CRT effects.

## v0.2.6-dev — Weather Layout Correction

### Changed
- Collapsed the Command module rail while Weather Surveillance is open.
- Widened and forced the right-side weather panels into a single readable vertical column.
- Preserved a large central storm map while improving right-panel legibility.
- Covered the obsolete projected-track legend baked into the source map; the functional legend remains in the dedicated panel.

## v0.2.6-dev — Weather Layout and Animation Refinement

### Changed
- Extended the weather composite to use the full available display height.
- Added a subtly animated storm layer over fixed terrain.
- Replaced circular site pulses with slow-blinking triangular base markers.
- Moved projected-track information into a dedicated map legend combined with latest observations.
- Repositioned the advisory and system log into the side columns to enlarge the central map.


## v0.2.3-dev — Weather Display Repair

### Fixed
- Restored borders, padding, and panel hierarchy throughout the weather interface.
- Added the terrain-and-storm composite as both a CSS background and image fallback.
- Preserved bounded telemetry, site pulses, and subtle CRT effects.

## v0.2.3-dev — Weather Composite Correction

### Changed
- Replaced the procedural symmetrical storm graphic with the approved terrain-and-storm satellite composite.
- Removed the radar sweep animation.
- Removed the artificial rotating storm and drifting track overlays.
- Retained subtle pulsing indicators over Horizon Base and Heron Station.
- Preserved bounded telemetry and subtle CRT effects.

## v0.2.3-dev — Planetary Weather Surveillance
Date: 2026-07-23
Status: Development

### Added
- Functional Command Terminal weather alert panel
- Full Planetary Weather Surveillance subsystem
- Animated radar sweep, storm rotation, projected track, and site indicators
- Bounded live telemetry fluctuations
- Communications, advisory, observations, and system-log panels
- Subtle CRT scanline and flicker effects

## v0.2.0-dev — Terminal Module Framework
**Status:** Development milestone

### Added
- Data-driven terminal profile system.
- Four terminal-specific visual themes and layouts.
- Fully interactive Command Terminal reference module.
- Command sections: System Overview, Personnel, Operations, Archives.
- Reusable document viewer for maps, charts, and personnel files.
- Horizon Base maps, maintenance map, personnel rosters, organization chart, and timeline assets.
- Dedicated Medical, Dr. Edem, and ETV Argoza placeholder frameworks that intentionally differ from Command.

### Changed
- Replaced the universal placeholder layout with terminal-specific workspaces.
- Session storage upgraded to v2.
- Development service worker now avoids aggressive caching.

### Known Limitations
- Medical, Dr. Edem, and Argoza content is still placeholder content.
- Command archive locks are visual only.
- Audio system has not been installed.

## v0.3.0-dev — Weather Layout Sandbox
### Added
- Live developer sliders for command rail, weather columns, gap, text scale, map crop, marker positions, and blink speed.
- Auto-saved layout settings, Copy Settings, and Reset controls.
- Independent SVG base markers.
### Changed
- Removed the legend-cover patch and rectangular blink image.
- Forced the weather right column into a readable vertical stack.


## v0.3.7-dev — Weather Map & Overlay Sandbox
### Added
- Layered terrain and true transparent storm assets
- Live controls for storm animation, map markers, labels, projected path, uncertainty cone, and scale bar
- Copy-all-settings workflow for locking the approved map composition
### Changed
- Applied approved layout values supplied after v0.3.0 testing


## v0.3.7-dev — Command startup repair

### Fixed
- Restored the missing terminal profile registry.
- Restored Personnel, Operations, and Archives as Command sections instead of malformed terminal-profile entries.
- Removed the recovery-screen failure caused by an undefined `profiles` object.


## v0.4.3-dev — Overview Dev Tools rail fix

### Fixed
- Moved the Overview Dev Tools launcher into the left Command utility rail.
- Updated initialization so the rail launcher and developer panel are wired from the full workspace.

## 0.5.20-dev
- Added monochrome Active Facility Faults panel to the Horizon Base schematic.
- Added slow target-aware pan/zoom with tighter framing for doors.
- Added persistent inverted selection state for rooms, doors, and sensor markers.
- Added Armory, Medbay, Garage Door 02, Command, Habitat communications, vibration, and weather diagnostics.
- Added Dr. Edem password-controlled Medbay entry lock, persistent Freezer lock release, Airlock cycle sequence, and failed Garage Door command response.

## 0.5.23-dev
- Fixed stale asset-version references that could load mismatched schematic JavaScript and CSS.
- Restored schematic controls and interaction layering.
- Prevented an optional SVG overlay load failure from disabling the complete map initialization.
- Corrected automatic pan/zoom destination math and changed the map transform origin to the upper-left for predictable targeting.

## 0.5.23-dev
- Embedded all schematic SVG layers directly into the interface so the map no longer depends on runtime SVG fetches.
- Restored map visibility, room/door selection, pan, wheel/pinch zoom, and map controls.
- Replaced transformed-screen target math with native SVG bounding-box framing.

## 0.5.24-dev
- Added diagonal hatch markings to player-controllable Medbay, Freezer, and Airlock doors.
- Reduced schematic alert icon size by 25%.
- Replaced icon-position sliders with precise numeric X/Y inputs.
- Corrected alert-icon navigation to use saved icon coordinates instead of the untransformed local SVG bounds.

## 0.5.32-dev
- Replaced controllable-door hatch fills with bright attached control tabs on Medbay, Freezer, and both Airlock hatches.
