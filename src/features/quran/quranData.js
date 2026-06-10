// Loader + normalizer untuk ./public/quran-full.json
// Semua operasi pakai data lokal — no API call.

// ── Audio CDN ────────────────────────────────────────────────────
// Audio tetap streaming dari CDN (gak mungkin offline tanpa download file audio).
// Ganti konstanta ini kalau mau ganti sumber/tartil.
const AUDIO_CDN_URL =
  'https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/{surahNumber}.mp3'

// ── Juz boundaries (known, standard) ──────────────────────────────
// Format: [surahStart, ayahStart, surahEnd, ayahEnd]
// see https://en.wikipedia.org/wiki/Juz'
const JUZ_BOUNDARIES = [
  null, // 1-indexed, index 0 unused
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

// ── Module-level cache ───────────────────────────────────────────
let loadPromise = null

const load = async () => {
  if (loadPromise) return loadPromise
  loadPromise = fetch('/quran-full.json').then((r) => {
    if (!r.ok) throw new Error(`Gagal memuat data Al-Quran (${r.status})`)
    return r.json()
  })
  return loadPromise
}

// ── Field normalizers ────────────────────────────────────────────
// JSON file field → component-expected field mapping:
//   nomor        → number
//   nama_latin   → name_latin
//   nama_arab    → name (for display), name_arab
//   tempat_turun → revelation
//   jumlah_ayat  → number_of_ayahs
//   ayat[].nomor → ayah_number
//   ayat[].ar    → arab
//   ayat[].id    → translation
//   ayat[].tr    → transliteration (kept as-is)

const normalizeAyah = (a, surahNumber) => ({
  id: `${surahNumber}:${a.nomor}`,
  ayah_number: a.nomor,
  arab: a.ar,
  translation: a.id,
  transliteration: a.tr,
})

const surahAudioUrl = (surahNumber) =>
  AUDIO_CDN_URL.replace('{surahNumber}', surahNumber)

const normalizeSurah = (s) => ({
  number: s.nomor,
  name_latin: s.nama_latin,
  name_arab: s.nama_arab,
  name: s.nama_arab,
  revelation: s.tempat_turun,
  number_of_ayahs: s.jumlah_ayat,
  ayahs: (s.ayat || []).map((a) => normalizeAyah(a, s.nomor)),
  audio_url: surahAudioUrl(s.nomor),
})

// ── Public helpers ───────────────────────────────────────────────

export const getSurahs = async () => {
  const data = await load()
  return (data.quran || []).map(normalizeSurah)
}

export const getSurah = async (number) => {
  const data = await load()
  const raw = (data.quran || []).find((s) => s.nomor === number)
  return raw ? normalizeSurah(raw) : null
}

export const getJuz = async (number) => {
  const data = await load()
  const bounds = JUZ_BOUNDARIES[number]
  if (!bounds) return []

  const [surahStart, ayahStart, surahEnd, ayahEnd] = bounds
  const verses = []

  for (const surah of data.quran) {
    if (surah.nomor < surahStart || surah.nomor > surahEnd) continue

    for (const ayah of surah.ayat) {
      if (surah.nomor === surahStart && ayah.nomor < ayahStart) continue
      if (surah.nomor === surahEnd && ayah.nomor > ayahEnd) break

      verses.push({
        ...normalizeAyah(ayah, surah.nomor),
        surah_name: surah.nama_latin,
        surah_number: surah.nomor,
      })
    }

    if (surah.nomor >= surahEnd) break
  }

  return verses
}
