# Finance Tracker — complete setup guide

This guide is exhaustive: every prerequisite, every command, and the full
database schema inline so you can copy‑paste it.

The app runs in two modes:

| Mode | What you get | What it needs |
|------|--------------|---------------|
| **Local** (default) | Full tracker, charts, PWA install. Data stays in your browser. | Nothing — works out of the box. |
| **Cloud** | Everything above **plus** accounts, per‑user cloud sync, and the 4 Claude AI features. | A Supabase project + a Claude API key (steps below). |

---

## 0. Requirements (install these first)

| Requirement | Version / notes | How to get it |
|-------------|-----------------|---------------|
| **Node.js** | 18 or newer (`node -v` to check) | https://nodejs.org |
| **npm** | ships with Node (`npm -v`) | — |
| **A Supabase account** | free tier is fine | https://supabase.com |
| **Supabase CLI** | for deploying the AI function | see step 4.1 |
| **An Anthropic (Claude) API key** | pay‑as‑you‑go | https://console.anthropic.com → **API Keys** |

> If you only want the **local** app, you need just Node + npm. Skip to §1, then §6.

---

## 1. Run the app locally (both modes start here)

```bash
cd C:\Users\DELL\Desktop\my-app
npm install        # first time only
npm run dev        # starts the dev server (default http://localhost:5173)
```

Open the URL it prints. In local mode the header shows
**"Local mode · data stays on this device"** and the AI panels are hidden.
That is expected until you finish §2–§4.

---

## 2. Create the Supabase project (accounts + cloud sync)

1. Go to https://supabase.com → **New project**.
2. Give it a name and a **database password** (save this password somewhere).
3. Pick a region close to you → **Create new project** and wait ~2 minutes for
   it to provision.

### 2.1 Create the database table + security policies

Open your project → left sidebar → **SQL Editor** → **New query** → paste the
**entire block below** → click **Run**.

This is the full contents of [`supabase/schema.sql`](supabase/schema.sql):

```sql
-- Finance Tracker — database schema with row-level security.
-- Each user can only ever see and modify their own rows.

create table if not exists public.transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  date        date not null,
  type        text not null check (type in ('income', 'expense')),
  category    text not null,
  description text not null default '',
  amount      numeric not null check (amount > 0),
  created_at  timestamptz not null default now()
);

create index if not exists transactions_user_date_idx
  on public.transactions (user_id, date desc);

-- Row-level security: the heart of "security". Without an authenticated
-- session that matches user_id, no row is readable or writable.
alter table public.transactions enable row level security;

create policy "own rows: select"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "own rows: insert"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "own rows: update"
  on public.transactions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "own rows: delete"
  on public.transactions for delete
  using (auth.uid() = user_id);
```

You should see **"Success. No rows returned."** To confirm: sidebar →
**Table Editor** → you should now see a `transactions` table, and a small
**"RLS enabled"** shield on it.

### 2.2 Turn on email sign‑up

Sidebar → **Authentication** → **Providers** → **Email** → make sure it is
**enabled**. (Optional, for testing: **Authentication → Providers → Email →
turn OFF "Confirm email"** so new accounts work without an inbox round‑trip.)

### 2.3 Get your two frontend keys

Sidebar → **Project Settings** (gear) → **API**. Copy:

- **Project URL** → looks like `https://abcdefgh.supabase.co`
- **anon public** key → a long `eyJ...` string (this is the *public* key; it's
  safe in the browser because RLS protects the data).

---

## 3. Add the frontend env vars

In the project root (`C:\Users\DELL\Desktop\my-app`), copy the example file and
fill in the two values from §2.3.

```bash
copy .env.example .env      # Windows (PowerShell/cmd)
# cp .env.example .env      # macOS/Linux
```

Edit `.env` so it reads:

```
VITE_SUPABASE_URL=https://abcdefgh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...your-anon-key...
```

> The Claude key is **deliberately not here** — it must never reach the browser.
> It goes into the Edge Function in §4.

**Restart the dev server** (`Ctrl+C`, then `npm run dev` again) so Vite picks up
`.env`. The header should now show a **Sign in / Create account** form.

At this point **accounts + cloud sync work**. Create an account, sign in, and
your transactions save to Supabase (visible in **Table Editor → transactions**).
The AI panels are still hidden until §4.

---

## 4. Deploy the AI proxy (Claude features)

The AI features call Claude from a Supabase **Edge Function**
([`supabase/functions/ai/index.ts`](supabase/functions/ai/index.ts)) so the
Claude key stays server‑side.

### 4.1 Install the Supabase CLI

```bash
npm install -g supabase       # simplest; or use Scoop/Homebrew per Supabase docs
supabase --version            # confirm it installed
```

### 4.2 Log in and link the CLI to your project

```bash
supabase login                # opens a browser to authorize
```

Find your **project ref** (the `abcdefgh` part of your Project URL, also under
**Project Settings → General → Reference ID**), then:

```bash
cd C:\Users\DELL\Desktop\my-app
supabase link --project-ref abcdefgh
```

### 4.3 Set the Claude API key as a secret

```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-your-real-key-here
```

### 4.4 Deploy the function

```bash
supabase functions deploy ai
```

When it finishes, reload the app (signed in). The two AI cards —
**"Quick add"** and **"Insights & budget"** — and the **"AI suggest"** link in
the add form now appear.

---

## 5. Verify each AI feature

Signed in, with §2–§4 done:

1. **Quick add** — type `spent 4500 on a taxi yesterday` → **Parse**. It should
   show a draft (expense · Transport · yesterday's date · 4,500 FCFA) → **Add**.
2. **AI suggest** — in *Add transaction*, type a description like
   `pharmacy receipt`, click **AI suggest** → Category jumps to **Health**.
3. **Explain my spending** — click it in *Insights & budget* → a short
   plain‑English summary appears.
4. **Suggest budgets & flag anomalies** — click it → a budget table plus any
   flagged unusual charges.

If a call fails, see **Troubleshooting** below.

---

## 6. Install as a mobile app / publish online (PWA)

- **Install on a phone:** open the app's URL in a mobile browser → **Add to
  Home Screen**. It launches full‑screen and works offline (cached shell).
- **Publish online:** build the static site and deploy the `dist/` folder to any
  static host:

  ```bash
  npm run build           # outputs dist/
  npm run preview         # optional: preview the production build locally
  ```

  Then deploy `dist/` to Vercel, Netlify, Cloudflare Pages, or Supabase Hosting.
  Set the same two `VITE_SUPABASE_*` env vars in the host's dashboard so the
  deployed site talks to your Supabase project. (The service worker only
  activates in the production build, not in `npm run dev`.)

---

## 7. Troubleshooting

| Symptom | Cause / fix |
|--------|-------------|
| Header still says "Local mode" | `.env` missing or dev server not restarted. Confirm both `VITE_SUPABASE_*` values are set, then restart `npm run dev`. |
| AI cards don't appear | AI is gated behind Supabase config — finish §3 first. The cards need `VITE_SUPABASE_*` set (they call the Edge Function). |
| AI card shows an error | Function not deployed or key not set. Re‑run §4.3 and §4.4. Check logs: `supabase functions logs ai`. |
| "ANTHROPIC_API_KEY not set" | The secret didn't take. Re‑run `supabase secrets set ANTHROPIC_API_KEY=...`, then redeploy: `supabase functions deploy ai`. |
| Sign‑up says "check your email" and you're stuck | Disable email confirmation (§2.2) for testing, or confirm via the email Supabase sent. |
| Rows don't save when signed in | Schema not applied or RLS blocking. Re‑run the §2.1 SQL; make sure you're signed in (RLS requires `auth.uid()`). |
| Claude 401 / auth error in function logs | The `sk-ant-...` key is wrong or lacks credit. Regenerate at console.anthropic.com and re‑set the secret. |

---

## Requirements recap (cloud mode)

To have **everything** working you need, in order:

1. Node 18+ and `npm install` (§0–1)
2. A Supabase project (§2)
3. The schema SQL run in that project (§2.1)
4. Email auth enabled (§2.2)
5. `.env` with `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (§3)
6. Supabase CLI installed, logged in, and linked (§4.1–4.2)
7. `ANTHROPIC_API_KEY` set as a function secret (§4.3)
8. `supabase functions deploy ai` run successfully (§4.4)

Model: the function uses `claude-opus-4-8` (change the `MODEL` constant in
`supabase/functions/ai/index.ts` to use another).
