# Niche Checker

A web app version of the Sebt Rise Batch 14 niche-research tracker. Fill in
the metrics for any niche and get an instant verdict (Great / Review / Skip /
Reject) based on the course criteria. No more Excel files.

## What it does

- Scores a niche against 17 criteria from your course notes (Core Metrics,
  SERP Analysis, Quality Checks).
- **Standard / APK toggle** in the header switches the rule set. APK mode
  raises the bar where your notes differ: search volume must be 30,000+,
  competitor DR under 30, and only 2 weak SERP sites are required instead of
  3. Affected rules update live and saved niches remember which mode they
  were scored in.
- Live verdict and percentage score as you type.
- "Safe topic" is a critical check — a No instantly REJECTS the niche
  (gambling / adult / YMYL / copyright).
- "Download-focused" is a bonus signal and is not counted in the score.
- Save niches to compare them side by side. Saved data stays in your browser
  (localStorage) — nothing is sent anywhere.

## Run locally

You need Node.js 18.18 or newer installed.

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## Deploy to Vercel

### Option A — via GitHub (recommended)

1. Push this folder to a new GitHub repository.
2. Go to https://vercel.com and sign in.
3. Click **Add New > Project**, import your repository.
4. Vercel auto-detects Next.js — just click **Deploy**. No settings needed.
5. You get a live URL in about a minute.

### Option B — via the Vercel CLI

```bash
npm install -g vercel
vercel
```

Follow the prompts. Run `vercel --prod` to push a production deploy.

## Editing the criteria

All checks, rules, thresholds and scoring live in `lib/criteria.js`. Each
check has base values, and an optional `modes` block with per-mode overrides
(see how `volume`, `dr` and `weaksites` define an `apk` override). To change a
threshold, edit the `test` function. To add a new check, add an object to the
relevant section &mdash; the UI, toggle and scoring update automatically.

## Tech

Next.js 14 (App Router) + Tailwind CSS. Static, no backend.
