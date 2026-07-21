# Deploy & install on your phone (PWA)

Your build is already PWA-verified: valid manifest, active service worker,
offline app-shell cache. You just need to put `dist/` on an HTTPS URL and
install it. **HTTPS is required** — a phone can't install a PWA over plain
`http://<LAN-IP>`, so a local-network preview won't work; you need a host.

---

## Fastest path (no CLI, no host account setup): Netlify Drop

Because you built `dist/` locally *with your `.env` present*, your Supabase keys
are already baked into the bundle — so a pre-built drop works with zero config.

1. Build (already done, but to be safe):
   ```bash
   cd /c/Users/DELL/Desktop/my-app
   npm run build
   ```
2. Go to **https://app.netlify.com/drop** and drag the **`dist`** folder onto it.
3. It gives you an HTTPS URL like `https://random-name.netlify.app` in seconds.
4. Open that URL on your phone → install (steps below).

> Downside: it's a one-off upload. To re-deploy after changes, drag `dist` again
> (or use the Git flow below for auto-deploys).

---

## Recommended for a stable URL + auto-deploys: Vercel

```bash
npm install -g vercel        # one time
cd /c/Users/DELL/Desktop/my-app
vercel                       # first run: log in + link the project
```
Then set the two build-time env vars (the bundle needs them at build):
```bash
vercel env add VITE_SUPABASE_URL          # paste your Supabase URL when prompted
vercel env add VITE_SUPABASE_ANON_KEY     # paste your anon/publishable key
vercel --prod                             # deploy to the production URL
```
`vercel.json` (already in the repo) handles SPA routing and service-worker
cache headers. Netlify users: `netlify.toml` does the same — `npm i -g
netlify-cli`, `netlify deploy --prod`, and set the same two env vars in the
Netlify dashboard (**Site settings → Environment variables**).

> ⚠️ With Vercel/Netlify **building on the host**, the `.env` file is NOT
> uploaded (it's gitignored). You MUST set `VITE_SUPABASE_URL` and
> `VITE_SUPABASE_ANON_KEY` in the host, or the deployed app falls back to local
> mode. (The Netlify Drop path above skips this because it uploads your
> already-built bundle.)

---

## Install on the phone

Open your deployed HTTPS URL in the phone browser, then:

- **Android (Chrome):** tap **⋮** menu → **Install app** (or **Add to Home
  screen**). You may also get an automatic install banner.
- **iPhone (Safari — required, Chrome on iOS can't install):** tap the **Share**
  icon → **Add to Home Screen** → **Add**.

It launches full-screen (no browser chrome), keeps you signed in, and loads
offline. Sign in with the account you created (make sure email confirmation is
sorted per SETUP.md, or use "Continue without an account" for local-only).

---

## One Supabase setting for the live URL

If you keep **email confirmation on**, add your deployed URL to Supabase →
**Authentication → URL Configuration → Site URL / Redirect URLs**, so
confirmation links point back to the live app. If confirmation is off, this
isn't needed. Sign-in itself works from any origin (the anon key is public and
your data is protected by row-level security).
