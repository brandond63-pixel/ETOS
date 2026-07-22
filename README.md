# ETOS v0.1.0 — Core Shell

Ellison-Tanaka Operating System is an offline-capable Progressive Web App designed for iPad landscape use.

## Included in this milestone
- Corporate boot screen
- Installable PWA manifest
- Offline service-worker cache
- Full-screen standalone layout
- Four placeholder terminal identities
- Hidden Warden access by holding the corporate logo for 3 seconds
- PIN-protected Warden panel
- 8-second terminal reassignment sequence
- Persistent local session state
- Portrait orientation warning

## Warden PIN
`8722`

## Test on a computer
A service worker will not run reliably by double-clicking `index.html`. Serve the folder with a small local server:

### Python
```bash
cd ETOS_v0.1.0
python -m http.server 8080
```
Then open `http://localhost:8080`.

## Install on iPad
1. Place this folder on any HTTPS web host or serve it from a computer reachable on the same Wi-Fi network.
2. Open the ETOS address in Safari on the iPad.
3. Tap **Share**.
4. Tap **Add to Home Screen**.
5. Launch ETOS from its Home Screen icon.
6. Open it once while connected so all assets can be cached.
7. Test in Airplane Mode before the session.

## Warden controls
Hold the Ellison-Tanaka logo for three seconds. Enter the Warden PIN. You can select Command, Medical, Dr. Edem, or Argoza and then run the terminal transfer sequence.

## Known limitation
This milestone contains terminal placeholders only. Campaign records, audio, passwords, personnel data, and custom terminal navigation will be added in later versions.
