# ETOS v0.5.20-dev

This refinement pass reorganizes the Horizon Facility Management home screen around a left-weighted control column and subdued corporate identity field. It also standardizes contextual back versus main-menu navigation, strengthens personnel hierarchy, enlarges operational record histories, corrects the final biosignal row, and removes the selected-room pulse.

The canonical 25-person colony roster is also available as `docs/ETOS_Personnel_Roster.txt` for reference outside ETOS.

This build replaces the Command Terminal's Base & Infrastructure placeholder with Facility Management. Its landing screen compares Horizon Base and Heron Station, while Horizon opens into personnel, schematics, vehicle, and work-order records. Heron remains passive distress-carrier telemetry with no handshake or remote controls.

The supplied Horizon map SVGs are stacked without modifying the exported artwork. The map supports room selection, touch dragging, pinch/wheel zoom, and a protected maintenance overlay. Artwork changes should be made in the separate Illustrator master and re-exported; do not edit the packaged SVG exports directly.

The archived signal uses the approved 11.5-second V3 organic insect recording. Its waveform is calculated from the actual recording and its illuminated progress and playhead remain synchronized with playback. ETOS begins loading the packaged WAV during startup, stores the completed file in memory for the session, and retains direct-file playback as a fallback.

All visible corporate logo and emblem placements now use the supplied transparent, symbol-only `assets/img/ellison-tanaka-logo.svg`. Legacy PNG logo files remain in the archive for compatibility but are not referenced by the interface.

The archive contains Corporate Directives 001, 014, and 015. Directive 015 is executive-restricted.

The portable settings reference is stored at `docs/command-overview-defaults.json`.

# ETOS v0.2.6-dev

Offline HTML/CSS/JavaScript development build for the Ellison-Tanaka Operating System.

## Start on Windows
1. Unzip the folder.
2. Double-click `Start ETOS.bat`.
3. Leave the PowerShell window open while testing.
4. ETOS opens at `http://localhost:8080`.

## Warden Access
Hold the corporate logo or active terminal title for three seconds.

PIN: `8722`

## Corporate Directive 015

Authorization code: `51895`

The intended player-facing code can be discovered through Dr. Claire Edem's private terminal in a later content pass.

Warden-controlled hack route:

1. Open Command → Corporate Directive Archive → Directive 015.
2. On the authorization screen, hold the unmarked Ellison-Tanaka emblem for three seconds.
3. A short security-bypass animation plays and opens Directive 015.

There is no visible hack hint or control label in the player interface.

## Facility Management Access Codes

Personnel biosignal monitor: `51895`

Maintenance schematics: `12345`

Both Facility Management authorization screens also support the Warden-controlled hidden route: hold the unmarked Ellison-Tanaka emblem for three seconds. No hint or hack control is shown to players.

## Facility Management Typography Tool

Enable **Show developer controls in terminal UI** from the Warden panel, then open Command > Facility Management and select **TYPOGRAPHY**. The tool controls comparison, station, module, organization, map, vehicle, work-order, and biosignal text. Changes apply live and can be saved, reset, or copied as JSON for a future source-default build.

The maintenance code is intentionally simple and is intended to be found on Demar, the Horizon Base mechanic. The protected overlay is opened from Command → Facility Management → Horizon Base → Facility Schematics → View Maintenance Schematics.

## Communications Archive

Open Command → Communications Status.

- The selected message appears to the right of the dated transmission history.
- Directive links open the existing directive documents above Communications. Clicking outside closes the overlay, and Directive 015 retains its password and hidden hack protection.
- The Dr. Edem support-request reference is narrative only and does not automatically change terminals.
- Select `UNIDENTIFIED SIGNAL INTERCEPT`, then `PLAY SIGNAL`, to play the archived V3 recording.
- The separate `COMMISSARY PA PLAYBACK REQUEST` record documents Dr. Hinton's use of the archived intercept and links back to the associated recording.
- Select the blinking Communications Diagnostic card to compare modeled storm attenuation with observed orbital-uplink loss.
- Playback is intentionally not accompanied by an in-world warning; consequences remain under Warden control.

## Communications Typography Tool

Enable **Show developer controls in terminal UI** from the Warden panel, then open Command > Communications and select **TYPOGRAPHY**. Changes apply live and save on the current computer. **COPY SETTINGS** copies a JSON block that can be pasted into the development conversation and baked into a later source build. Unchecking the Warden option hides the tool without discarding the selected sizes.

## Current milestone
The Command Terminal is the reference implementation. Medical, Dr. Claire Edem, and ETV Argoza demonstrate distinct terminal layouts and will receive full campaign content in later builds.


This build adds the functional Planetary Weather Surveillance module to the Command Terminal.


## Weather refinement in v0.2.6-dev
- Terrain composite now fills the weather display vertically.
- Storm layer drifts and rotates subtly over fixed terrain.
- Base triangles blink slowly; circular pulses were removed.
- Projected-track legend is combined with latest observations inside the map.

## Weather Layout Sandbox
Open Command → Planetary Weather Surveillance and select **LAYOUT SANDBOX** in the lower-right. Changes apply instantly and save on the current computer. Use **COPY SETTINGS** when the layout is ready.


## Weather development tools
Open Command > Weather and select WEATHER DEV TOOLS. Settings save locally and COPY ALL SETTINGS creates a JSON block for the next locked build.
# ETOS audio

`js/audio.js` exposes the centralized `window.ETOSAudio` API. Sound identities are invoked with `ETOSAudio.play(name)`, and future Warden controls can use `setVolume(group,value)` for the `master`, `ambient`, `ui`, `system`, and `mechanical` buses. Electronic cues and ambience are synthesized with Web Audio; only the two physical mechanism cues use WAV assets. Archived communications playback remains independent.
