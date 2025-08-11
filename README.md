# Post-it Layers (PWA) — GitHub Pages

**Quick deploy (no CLI):**
1. Create a new public repo on GitHub (e.g. `postit-layers`).
2. Upload these files (drag & drop the *contents* of the folder — `index.html`, `sw.js`, `manifest.json`, `.nojekyll`).
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, set **Source** = “Deploy from a branch”.
5. Choose **Branch** = `main` (or `master`) and **Folder** = `/ (root)` → **Save**.
6. Wait ~1–2 minutes. Your site will appear at:
   - `https://<your-username>.github.io/<repo-name>/`

**Install on Android:**
- Open the URL in Chrome → menu (⋮) → **Add to Home screen**.

**Notes**
- This build uses CDN scripts (`unpkg.com`) and inline script. GitHub Pages allows it by default.
- If you see a blank page, open **DevTools → Console** to check errors.
- To clear a stuck service worker after an update: **DevTools → Application → Service Workers → Unregister**, then hard refresh.
