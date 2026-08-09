# ETV Argoza Cryo Teaser

This is a standalone, player-facing cinematic. It is isolated from the ETOS application and uses only local HTML, CSS, JavaScript, and the existing Ellison-Tanaka logo asset.

## Run it

Start ETOS normally, then open:

`http://localhost:8080/cryo/`

Press **INITIALIZE TERMINAL** once. That gesture unlocks the synthesized WebAudio ambience and begins the sequence automatically.

## Change the revival date or time

Open `cryo/script.js` and edit the obvious constant near the top:

```js
const REVIVAL_TARGET_DATETIME = '2122-08-29T08:00:00-07:00';
```

Keep the value in ISO-8601 format and include the intended UTC offset. The visible countdown is calculated live from that target and updates once per second after it appears.

## Repository placement

Keep the whole `cryo` folder at the ETOS repository root, beside `index.html`, `css`, `js`, and `assets`. The page references the existing logo at `assets/img/ellison-tanaka-logo.svg`; no CDN or network dependency is used.

For quick testing only, append `?test=1` to accelerate the cinematic timing. Normal playback does not use this parameter.
