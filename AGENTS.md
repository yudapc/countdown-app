# Muslim App — Agent Guide

Mobile-first React PWA: Tasbih counter, Countdown timer, Al-Quran reader, Hadits encyclopedia, Waktu Sholat.

## Commands

```sh
bun run dev       # Vite dev server (or npm run dev)
bun run build     # Production build → dist/
bun run lint      # ESLint (flat config: eslint.config.js)
bun run preview   # Preview production build
```

No test framework installed. No typecheck step.

## Architecture

- **Framework:** React 19 + react-router-dom 7 (Pages Router style — `useParams`, `useNavigate`, `Route`)
- **Build:** Vite 6 + `@vitejs/plugin-react`
- **PWA:** `vite-plugin-pwa` with `injectManifest` strategy, custom `src/sw.js`, auto-update, navigateFallback, home-screen shortcuts (`/tasbih`, `/quran`, `/sholat`)
- **Deploy:** Vercel SPA rewrites (`vercel.json` rewrites all paths to `index.html`)
- **No state management library** — uses React context + localStorage only

## Project layout

```
src/
  app/App.jsx            # Root layout, bottom tabs, routing, header, SEO, theme
  features/
    tasbih/              # /tasbih — digital tasbih counter
    countdown/           # /waktu — countdown timer with SVG ring
    quran/               # /quran[/:surahNumber], /quran/juz/:juzNumber
    hadits/              # /hadits[/:slug] — hadith by narrator
    waktusholat/         # /sholat — prayer times with local adhan calculation
  sw.js                  # Custom service worker (injectManifest) for background notifications
  shared/                # Shared components, context, hooks, utils
    context/             # AudioContext, AyahAudioContext, HeaderContext, CountdownContext
    providers/           # CountdownProvider
    hooks/               # useCountdown, useLocalStorageState
    utils/               # apiCache (localStorage-based)
```

- Entry: `src/main.jsx` mounts `<BrowserRouter>` → wraps 4 providers (`CountdownProvider`, `HeaderProvider`, `AudioProvider`, `AyahAudioProvider`)
- Default path `/` redirects to `/tasbih`
- Feature components exported from `src/features/index.js`
- Shared utilities exported from `src/shared/index.js`

## Key details

- **Quran data is fully local** — `public/quran-full.json` (~38K lines) loaded via `fetch('/quran-full.json')`. No API calls for Quran.
- **Hadits data is from API** — `https://api.myquran.com/v2/hadis/perawi` (narrators) and `https://api.myquran.com/v3/hadis/enc/explore?page=N` (hadiths). Cached in localStorage via `apiCache` utils.
- **Audio** streams from CDN — surah audio: `cdn.islamic.network/quran/audio-surah/128/ar.alafasy/`; ayah audio: `everyayah.com/data/Abdul_Basit_Murattal_192kbps/`.
- **Two audio contexts** — `AudioContext` (full surah, persistent across tabs with floating chip), `AyahAudioContext` (per-ayah playback within surah/juz view). They operate independently.
- **Countdown** persists via localStorage (`countdown-end-at`, `countdown-started-at`). Alarm plays `ringtone.wav` on expiry. Floating chip on other pages when active.
- **Waktu Sholat** uses `adhan` npm package for local calculation (`CalculationMethod.Singapore()` which matches Kemenag: 20° Fajr, 18° Isha). Uses `navigator.geolocation` for coordinates. Caches location in localStorage. Toggle for adhan audio (`adhan.mp3` in `public/`) plays at prayer time. Service worker handles background notifications via `postMessage`.
- **Theme** — cycles system → light → dark. Stored in localStorage as `theme-mode`.
- **Header** is dynamic — feature views call `setHeader(title, backNav)` from `HeaderContext`, the root App renders it; used by Quran and Hadits detail views.
- **Fonts** — Sora (Google Fonts, Latin/UI text), Scheherazade New (local `public/fonts/*.ttf`, Arabic text)
- **SEO** — updated dynamically in App.jsx per route (title, meta, OG tags, canonical URL)
- **No CSS framework** — plain CSS files (`App.css`, `index.css`) with `data-theme` attribute for dark mode
- **No generated code, migrations, or codegen** — straightforward Vite SPA

## Conventions

- Feature-first directories: each feature in `src/features/<name>/` with its own `index.js` barrel
- Shared code in `src/shared/` — components, hooks, context, providers, utils
- Named exports for hooks/context, default exports for components
- Feature hooks named `use<Feature><Purpose>` (e.g. `useQuranList`, `useHadithList`)
- All text in Indonesian (id-ID) — UI labels, error messages, SEO descriptions
- React Refresh `only-export-components` is a warning — component-export-only files expected
- `no-unused-vars` error with `varsIgnorePattern: '^[A-Z_]'`
