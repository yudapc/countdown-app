# Technical Design Document — Muslim App

## 1. Project Structure

```
countdown-app/
├── docs/
│   ├── PRD.md
│   └── Technical Design Document.md
├── public/
│   ├── pwa-icon.svg
│   ├── robots.txt
│   ├── sitemap.xml
│   └── ringtone.wav
├── src/
│   ├── app/
│   │   └── App.jsx              # Root layout, routing, header, bottom tabs
│   ├── features/
│   │   ├── tasbih/
│   │   │   ├── TasbihFeature.jsx
│   │   │   ├── hooks/
│   │   │   │   ├── usePersistentCount.js
│   │   │   │   └── index.js
│   │   │   └── index.js
│   │   ├── countdown/
│   │   │   ├── CountdownFeature.jsx
│   │   │   └── index.js
│   │   ├── quran/
│   │   │   ├── QuranFeature.jsx
│   │   │   ├── hooks/
│   │   │   │   ├── useQuranList.js
│   │   │   │   ├── useSurahDetail.js
│   │   │   │   ├── useJuzDetail.js
│   │   │   │   └── index.js
│   │   │   └── index.js
│   │   ├── hadits/
│   │   │   ├── HaditsFeature.jsx
│   │   │   ├── hooks/
│   │   │   │   ├── useNarrators.js
│   │   │   │   ├── useHadithList.js
│   │   │   │   └── index.js
│   │   │   └── index.js
│   │   └── index.js
│   ├── shared/
│   │   ├── components/
│   │   ├── context/
│   │   │   ├── AudioContext.jsx   ← Persistent audio player
│   │   │   ├── HeaderContext.jsx  ← Dynamic header config
│   │   │   ├── CountdownContext.js
│   │   │   └── index.js
│   │   ├── hooks/
│   │   │   ├── useCountdown.js
│   │   │   ├── useLocalStorageState.js
│   │   │   └── index.js
│   │   ├── providers/
│   │   │   └── CountdownProvider.jsx
│   │   ├── utils/
│   │   │   ├── apiCache.js
│   │   │   └── index.js
│   │   └── index.js
│   ├── App.jsx                  # Re-export from app/App
│   ├── App.css                  # All component styles
│   ├── index.css                # CSS variables, theme, global reset
│   └── main.jsx                 # Entry point, providers
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## 2. Component Tree

```
<BrowserRouter>
  <CountdownProvider>          ← Manages countdown state + progress
    <HeaderProvider>           ← Provides header config to App shell
      <AudioProvider>          ← Persistent audio across tab switches
        <App>
          ├── <header>           ← Dynamic: tab name or back button + title
          ├── <main>
          │   └── <Routes>
          │       ├── /tasbih                    → <TasbihFeature>
          │       ├── /waktu                     → <CountdownFeature>
          │       ├── /quran                     → <QuranFeature> (list)
          │       ├── /quran/:surahNumber         → <QuranFeature> (SurahView)
          │       ├── /quran/juz/:juzNumber        → <QuranFeature> (JuzView)
          │       ├── /hadits                    → <HaditsFeature> (list)
          │       └── /hadits/:slug               → <HaditsFeature> (HaditsView)
          ├── <chip.countdown>   ← Floating countdown chip (all tabs except /waktu)
          ├── <chip.audio>       ← Floating audio chip (all tabs except current surah)
          └── <nav.bottom-tabs>   ← 4 icon-only tabs
```

## 3. Data Sources & API Contracts

### Base URL: `https://api.myquran.com`

#### Quran — Surah List
```
GET /v3/quran
→ { status: true, data: [{ number, name, name_latin, number_of_ayahs, translation, revelation, description, audio_url }] }
```
Cache key: `muslim-cache-quran-list`

#### Quran — Surah Detail
```
GET /v3/quran/{number}
→ { status: true, data: { number, name, name_latin, number_of_ayahs, translation, revelation, description, audio_url, ayahs: [{ id, surah_number, ayah_number, arab, translation, audio_url, image_url, tafsir }] } }
```
Cache key: `muslim-cache-surah-{number}`

#### Quran — Juz Detail
```
GET /v3/quran/juz/{number}
→ { status: true, data: [{ id, surah_number, ayah_number, arab, translation, audio_url, image_url, tafsir, meta, surah }] }
```
Note: `data` is a **direct array** of ayahs (not nested under a key).
Cache key: `muslim-cache-juz-{number}`

#### Hadits — Narrator List
```
GET /v2/hadis/perawi
→ { status: true, data: [{ name, slug, total }] }
```
Cache key: `muslim-cache-hadits-narrators`

#### Hadits — Encyclopedia Explore (Paginated)
```
GET /v3/hadis/enc/explore?page={n}
→ { status: true, data: { paging: { current, per_page, total_data, total_pages, has_prev, has_next, next_page, prev_page }, hadis: [{ id, text: { ar, id }, grade, takhrij, hikmah }] } }
```
Cache key: `muslim-cache-hadits-explore-{page}`

## 4. Caching Strategy

### Implementation: `src/shared/utils/apiCache.js`

- **Strategy**: Cache-forever (no TTL)
- **Storage**: localStorage with prefix `muslim-cache-`
- **Key format**: `muslim-cache-{resource}-{identifier}`
- **Cache check**: Before any fetch, check localStorage. If found, set state synchronously and skip network.
- **Cache set**: After successful fetch, serialize and store in localStorage.
- **Error handling**: If localStorage is full or unavailable, silently ignore and continue without cache.
- **Clear**: `clearAllCache()` utility available for manual cache invalidation.

### Flow
```
Component mounts
  → Hook checks localStorage cache
    → Cache hit? Set state from cache. Done.
    → Cache miss? Fetch API → Store in cache → Set state.
```

## 5. State Management

No external state library (Redux, Zustand). Uses:
- **React Context**: `CountdownProvider` for countdown timer state, `HeaderProvider` for dynamic header, `AudioProvider` for persistent audio player.
- **Custom Hooks**: Encapsulate data fetching + caching logic.
- **useLocalStorageState**: Generic hook for persistent state (theme, tasbih count, countdown).

## 6. Styling Architecture

### CSS Variables (`src/index.css`)
Two themes via `data-theme` attribute on `<html>`:
- **Light** (`data-theme="light"`): Warm earth tones, green primary.
- **Dark** (`data-theme="dark"`): Dark forest tones, green accent.

### Theme Variables
| Variable | Light | Dark |
|----------|-------|------|
| `--bg` | `#f0f2eb` | `#0f1a12` |
| `--primary` | `#2d6a4f` | `#4ade80` |
| `--secondary` | `#b9935a` | `#d4a373` |
| `--text` | `#1a2e1f` | `#e8f0e8` |

### Theme Toggle
Cycles: system → light → dark → system. Media query listener detects system preference.
- `useEffect` fires on `[themeMode, deviceTheme]` (not `[activeTheme]`) to apply the correct data-theme even when the computed value doesn't change (e.g., system → light when device is already light).

### Bottom Tab Bar (Glass Effect)
- `position: fixed; bottom: 0` with `backdrop-filter: blur(24px)` for iOS-style frosted glass
- Light theme: `rgba(240, 242, 235, 0.65)` background
- Dark theme: `rgba(15, 26, 18, 0.75)` background
- `will-change: backdrop-filter` for GPU-accelerated blur
- `padding-bottom: env(safe-area-inset-bottom)` for notched devices
- 4 icon-only buttons with ARIA labels, no visible text labels

## 7. PWA Configuration

- **Service Worker**: Generated by Workbox (vite-plugin-pwa)
- **Caching**: Network-first with offline fallback (navigateFallback: index.html)
- **Auto-update**: New SW installs immediately (skipWaiting + clientsClaim)
- **Periodic check**: Every 60 minutes + on visibility change
- **Manifest**: Name "Muslim", green theme color, portrait orientation
- **Shortcuts**: Tasbih, Al-Quran (PWA app shortcuts)

## 8. SEO & Metadata

- Per-route dynamic `<title>` and `<meta name="description">`
- Open Graph tags (og:title, og:description, og:url, og:image)
- Twitter Card tags
- JSON-LD structured data (WebSite + SoftwareApplication)
- Canonical URL per route
- Sitemap.xml + robots.txt

## 9. Key Implementation Details

### Tasbih Beads Animation
- 33 beads arranged in a circle (280px diameter, 14px beads) via CSS `sin()`/`cos()` positioning
- Each bead computed angle: `i * (360/33) - 90 + gapShift` degrees in JSX
- Three visual states: `counted` (tiny 9px, opacity 0.3), `active` (enlarged 22px, gold glow, slide animation), `uncounted` (default 14px)
- **Gap**: 7° shift applied to all beads after the active one, creating a visible separation between counted and uncounted groups
- **Slide animation**: `bead-slide` keyframe (scale 1→1.7→0.88→1, 0.45s) plays each time `.active` class transfers to a new bead
- SVG circle string (`r=120`, `opacity=0.15`) behind the beads
- Dark theme maintains the same structure with deeper wood tones

### Countdown Progress Ring
- SVG `<circle>` with `stroke-dasharray`/`stroke-dashoffset`
- Progress = `(elapsed / total) * circumference`
- Updates every second via `setInterval` in CountdownContext
- CSS transition on `stroke-dashoffset` for smooth ring animation

### Audio Player
- `AudioProvider` context wraps the entire app, managing a single shared `Audio` element.
- `useAudio()` returns `{ currentSurah, playing, toggleSurah, pauseSurah, resumeSurah, stopSurah }`.
- `toggleSurah(surahNumber, surahName, audioUrl)` starts playback for a new surah, pauses/resumes current, or switches to a different surah.
- `Audio` element lives at the context level — survives tab switches and component unmounts.
- Cleanup on App unmount: pause, clear src, nullify reference.
- A floating gold chip (`<button.chip.chip-audio>`) appears on all tabs except when on the exact surah detail page that's playing (pathname matches `/quran/${currentSurah.number}`). Clicking the chip navigates directly to `/quran/${currentSurah.number}`.

### Floating Chips
Two floating chips appear at the top of the app (below header):
- **Countdown chip** (green): Shown when countdown is active and user is not on `/waktu`. Click navigates to the Waktu tab.
- **Audio chip** (gold): Shown when Quran audio is playing and user is not on the playing surah's detail page (`/quran/${currentSurah.number}`). Click navigates directly to the playing surah.
Both use a shared `.chip` base class with type-specific colors, animated in via `chip-in` keyframe.

### Routing
Each surah and narrator has a unique path for deep linking:
| Path | View |
|------|------|
| `/quran` | Surah list / Juz grid (via mode toggle) |
| `/quran/:surahNumber` | Surah detail with ayah list |
| `/quran/juz/:juzNumber` | Juz detail with ayah list |
| `/hadits` | Narrator list |
| `/hadits/:slug` | Hadith explorer for selected narrator |

Features read route params via `useParams()` and navigate via `useNavigate()` instead of internal state.

**Wrapper components for guaranteed remount**: Each route renders a distinct wrapper component (`QuranListPage`, `QuranSurahPage`, `QuranJuzPage`, `HaditsListPage`, `HaditsDetailPage`) instead of `key` props on `<Route>`. Different component types force React to unmount/remount on every navigation, ensuring state reinitializes correctly.

**Navigation state for mode persistence**: Back from juz detail passes `{ state: { mode: 'juz' } }` to `/quran`; back from surah detail passes `{ state: { mode: 'surah' } }`. List view reads `location.state?.mode` in its `useState` initializer to restore the correct tab on mount. Direct `/quran` access defaults to the surah list.

Back buttons navigate to the parent route with state (not `navigate(-1)`) to ensure correct mode restoration regardless of navigation history.

### Header Context
- `HeaderProvider` wraps the app
- `useHeader()` returns `{ title, onBack, setHeader, clearHeader }` — single setter/clearer with stable references (useCallback with empty deps) to avoid stale closure issues
- Feature components call `setHeader(title, backHandler)` when entering detail view
- **Consolidated header logic**: Header is set at the Feature level (not child View level) via a `useEffect` keyed on route params. For juz detail: `setHeader("Juz {n}", backToJuzList)`. For surah detail: SurahView sets header when API data loads (to show surah name). For hadits detail: effect keyed on `slug` sets/clears header.
- `useEffect` cleanup calls `clearHeader()` on unmount
- **Separate back callbacks**: `backToSurahList` and `backToJuzList` are distinct `useCallback`-memoized navigate calls, each passing the appropriate `state: { mode }` value. Detail views receive the correct callback via props.
- App shell renders back button + title when context is active, otherwise shows the current tab name (`TAB_NAMES` map: `/tasbih` → "Tasbih", `/waktu` → "Waktu", `/quran` → "Al-Quran", `/hadits` → "Hadits"), or "Muslim" as fallback.

## 10. Constraints & Known Issues

- **Hadits per-narrator filter**: The v3 encyclopedia endpoint does not support filtering by narrator slug. All narrator selections show the same encyclopedia with pagination.
- **No arabic script in surah list**: The `/v3/quran` list endpoint lacks arabic script (only `name` and `name_latin` are available).
- **localStorage limits**: Cache-forever strategy may exceed localStorage quota (~5MB) if user browses all 114 surahs + 30 juz + hundreds of hadith pages.
- **Audio streaming**: Requires network. No offline audio caching.
- **API rate limits**: myquran.com may have unadvertised rate limits; caching mitigates impact.
