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
