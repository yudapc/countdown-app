// ── Last-read position persistence (localStorage) ─────────────────────
const STORAGE_KEY = 'quran-last-read'

export const saveLastRead = ({ surahNumber, ayahNumber, surahName }) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        surahNumber,
        ayahNumber,
        surahName: surahName || '',
      })
    )
  } catch (e) {
    // localStorage unavailable — silently ignore
  }
}

export const getLastRead = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}

export const clearLastRead = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    // silently ignore
  }
}

// ── Juz boundary lookup ──────────────────────────────────────────────
// Format: [surahStart, ayahStart, surahEnd, ayahEnd]  (1-indexed)
const JUZ_BOUNDARIES = [
  null,
  [1, 1, 2, 141],
  [2, 142, 2, 252],
  [2, 253, 3, 92],
  [3, 93, 4, 23],
  [4, 24, 4, 147],
  [4, 148, 5, 81],
  [5, 82, 6, 110],
  [6, 111, 7, 87],
  [7, 88, 8, 40],
  [8, 41, 9, 93],
  [9, 94, 11, 5],
  [11, 6, 12, 52],
  [12, 53, 14, 52],
  [15, 1, 16, 128],
  [17, 1, 18, 74],
  [18, 75, 20, 135],
  [21, 1, 22, 78],
  [23, 1, 25, 20],
  [25, 21, 27, 55],
  [27, 56, 29, 45],
  [29, 46, 33, 30],
  [33, 31, 36, 27],
  [36, 28, 39, 31],
  [39, 32, 41, 46],
  [41, 47, 45, 37],
  [46, 1, 51, 30],
  [51, 31, 57, 29],
  [58, 1, 66, 12],
  [67, 1, 77, 50],
  [78, 1, 114, 6],
]

/**
 * Find which juz a given surah + ayah belongs to.
 * Returns juz number (1-30) or null if not found.
 */
export const findJuzForAyah = (surahNumber, ayahNumber) => {
  for (let juz = 1; juz <= 30; juz++) {
    const [sStart, aStart, sEnd, aEnd] = JUZ_BOUNDARIES[juz]
    if (
      (surahNumber > sStart || (surahNumber === sStart && ayahNumber >= aStart)) &&
      (surahNumber < sEnd || (surahNumber === sEnd && ayahNumber <= aEnd))
    ) {
      return juz
    }
  }
  return null
}
