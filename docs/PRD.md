# PRD: Muslim App

## 1. Product Overview

**Muslim** is a mobile-first PWA (Progressive Web App) that provides four essential Islamic tools in one lightweight application: Tasbih counter, Countdown timer, Al-Quran reader with per-juz browsing, and Hadits encyclopedia explorer.

### Goals
- Provide a fast, offline-capable Islamic companion app
- Eliminate the need for multiple separate apps for basic Islamic utilities
- Deliver a native-app-like experience through PWA with install prompt

## 2. Target Users

- Muslims who need a daily tasbih counter
- Muslims who read Al-Quran with Indonesian translation
- Muslims who study Hadits from the encyclopedia
- General users who need a countdown timer

## 3. Features

### 3.1 Tasbih Digital
- Increment/decrement counter with persistent count (localStorage)
- 33 beads arranged in a circle with three visual states: counted (dimmed/small), active (glowing/large with slide animation), uncounted (normal)
- Gap between counted and uncounted groups (7° angular shift)
- Quick presets: 33, 99, 100
- Reset with confirmation

### 3.2 Countdown Timer
- Set custom duration in minutes
- Circular SVG progress ring with animation
- Pause/Resume/Stop controls
- Persistent timer state across page refreshes (localStorage)
- Floating chip notification when active on other tabs

### 3.3 Al-Quran Reader
- List all 114 surah with search filtering
- Per-juz browsing (30 juz grid)
- Surah detail view with:
  - Audio playback for full surah (persists across tab switches via AudioProvider)
  - Floating audio chip when playing on non-Quran tabs
  - Arabic text with Indonesian translation
  - Surah info (name, revelation type, total ayahs)
- Data sourced from api.myquran.com/v3 (cached forever in localStorage)

### 3.4 Hadits Encyclopedia
- List 9 narrator collections with search filtering
- Paginated hadith explorer with Arabic + Indonesian text
- Grade and source attribution
- Data sourced from api.myquran.com/v3 (cached forever)

## 4. Technical Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 (Vite) |
| Routing | React Router DOM v7 |
| PWA | vite-plugin-pwa (Workbox) |
| Storage | localStorage |
| API | myquran.com (v2/v3) |
| Styling | Plain CSS with CSS variables |
| Font | Sora (Google Fonts) |

## 5. Architecture

### Data Flow
```
[Feature Component] → [Custom Hook] → [apiCache Utility] → [myquran.com API]
                       ↓                    ↓
                  [localStorage]    [localStorage Cache]
```

- All Quran and Hadits data is cached forever in localStorage after first fetch
- No authentication required — all APIs are public
- Countdown and Tasbih state persisted via useLocalStorageState hook

### Routing
| Path | Component | Description |
|------|-----------|-------------|
| `/` | Redirect → `/tasbih` | Default landing |
| `/tasbih` | TasbihFeature | Tasbih counter |
| `/waktu` | CountdownFeature | Countdown timer |
| `/quran` | QuranFeature | Surah list / Juz grid |
| `/quran/:surahNumber` | QuranFeature → SurahView | Surah detail with ayah |
| `/quran/juz/:juzNumber` | QuranFeature → JuzView | Juz detail with ayah |
| `/hadits` | HaditsFeature | Narrator list |
| `/hadits/:slug` | HaditsFeature → HaditsView | Hadith explorer per narrator |

Detail views (surah, juz, hadith list) use route-based navigation with `useParams` + `useNavigate`. Distinct wrapper components per route (e.g., `QuranListPage`, `QuranSurahPage`) guarantee React unmount/remount. Navigation state (`{ mode: 'surah'|'juz' }`) is passed on back navigation so the list view restores the correct tab.

### Navigation
- 4-tab bottom navigation (icons only, frosted glass effect with backdrop-filter blur): Tasbih | Waktu | Quran | Hadits
- Dark/Light theme toggle
- Dynamic header: shows current tab name (Tasbih/Waktu/Al-Quran/Hadits), back button + title on detail views
- Floating chips for active countdown and audio playback (visible across all tabs, hidden only on their respective source page)

## 6. Non-Functional Requirements

- Mobile-first responsive design (max-width 480px, centered on desktop)
- Installable as PWA with offline support via service worker
- SEO-optimized with Open Graph + JSON-LD structured data
- Dark mode support with persistent preference
- Accessibility: ARIA labels on icon-only buttons

## 7. Future Considerations

- Prayer times based on location
- Qibla direction compass
- Asmaul Husna
- Daily dhikr collection
- Bookmarking ayahs/hadiths
- Audio download for offline Quran listening
