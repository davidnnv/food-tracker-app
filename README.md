# Залак · Zalak — food tracker

A food diary built with React: log meals, see calories and macros at a glance, track water and weight, and spot patterns week by week. English and Macedonian, light and dark theme.

**Live:** https://davidnnv.github.io/food-tracker-app/ — tap **Try the demo** for an account with 4 weeks of sample meals.

## Features
- **Today** — animated calorie ring, protein/carbs/fat bars, four meals, week strip with a mini progress ring per day, logging streak
- **Add food** — search 60 foods (incl. Macedonian dishes: burek, tavče gravče, ajvar, shopska…) in English or Macedonian, recent and favourites, portion sizes or grams, live nutrition preview
- **Custom foods & quick add** — save your own foods, or log calories without picking a food
- **Edit, move and delete** entries, with **undo**; copy a meal from yesterday in one tap
- **Water** — animated tank and glass counter
- **Insights** — 7/30-day calorie chart with goal line and tooltips (plus a table view), average macro split, most-logged foods, month calendar coloured by goal status
- **Progress** — weight log with trend chart, change since start, BMI scale
- **Onboarding** — calculates daily targets with the Mifflin–St Jeor formula from age, height, weight, activity and goal
- **Settings** — profile, targets, language, theme, backup export/import, clear diary
- **Account menu on every page** (avatar, top right) with settings, language, theme, cookie settings and **log out**; log out is also in the sidebar. Logging out reloads the app on the login screen.
- **Cookies with a consent banner** — `zalak_session` (login, 30 days or until the browser closes if “Keep me logged in” is off), `zalak_consent` (your choice), `zalak_prefs` (language and theme, only if you allow preference cookies). Change the choice any time in the account menu or Settings.
- Diary data lives in the browser (`localStorage`); passwords are stored as salted SHA-256 hashes

## Stack
React 18 · Vite · React Router (hash routing for GitHub Pages) · Framer Motion · hand-drawn SVG charts · self-hosted Rubik + Golos Text fonts.

## Run locally
```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # production build in dist/
```

## Project structure
```
src/
  data/foods.js        food database (per 100 g, EN + MK names, portion sizes)
  lib/store.jsx        accounts, diary state, persistence, toasts
  lib/i18n.js          all UI text in English and Macedonian
  lib/nutrition.js     totals, targets calculator, BMI, day status
  lib/demo.js          builds the 4-week demo diary
  components/          ring, macro bars, week strip, meal card, add-food flow, charts…
  pages/               Auth, Onboarding, Today, Insights, Progress, Settings
```

## Deploy
Every push to `main` builds and publishes to GitHub Pages (`.github/workflows/deploy.yml`).
One-time setup: **Settings → Pages → Source: GitHub Actions**.
