# Post-it Layers (PWA) — GitHub Pages (Patched)
This build avoids modern JS features that the inline Babel transformer can choke on (e.g., empty `catch {}` and optional chaining).

**Deploy**
1. Create a *public* repo (e.g., `postit-layers`).
2. Upload these files at the repo root: `index.html`, `sw.js`, `manifest.json`, `.nojekyll`, `README.md`.
3. Settings → Pages → Source: *Deploy from a branch* → Branch: `main` → Folder: `/ (root)` → Save.
4. Wait 1–2 minutes → open: `https://<user>.github.io/<repo>/`.

Install on Android: open the URL in Chrome → menu → Add to Home screen.
