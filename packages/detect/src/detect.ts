import { midiToNote } from './midi'
import { frequencyToMidi } from './frequency'
import type { NoteStyle } from './midi'

// ---------------------------------------------------------------------------
// Note primitives (self-contained to keep this package zero-dep)
// ---------------------------------------------------------------------------

const NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const NOTES_FLAT  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

function noteIdx(note: string): number {
  const t = note.trim()
  let i = NOTES_SHARP.indexOf(t)
  if (i === -1) i = NOTES_FLAT.indexOf(t)
  if (i === -1) i = NOTES_SHARP.findIndex((n) => n[0] === t[0].toUpperCase())
  return i === -1 ? 0 : i
}

function noteName(idx: number, style: NoteStyle): string {
  const i = ((idx % 12) + 12) % 12
  return style === 'flat' ? NOTES_FLAT[i] : NOTES_SHARP[i]
}

// ---------------------------------------------------------------------------
// Chord pattern definitions
// ---------------------------------------------------------------------------

interface ChordType {
  /** Short suffix appended to the root name, e.g. "m", "7", "maj7" */
  suffix: string
  /** Quality label */
  quality: ChordQuality
  /** Interval set (semitones from root, must include 0) */
  intervals: number[]
}

export type ChordQuality =
  | 'major'
  | 'minor'
  | 'dominant7'
  | 'major7'
  | 'minor7'
  | 'diminished'
  | 'diminished7'
  | 'halfDiminished'
  | 'augmented'
  | 'augmented7'
  | 'suspended2'
  | 'suspended4'
  | 'dominant9'
  | 'major9'
  | 'minor9'
  | 'add9'
  | 'power'

const CHORD_TYPES: ChordType[] = [
  // Triads
  { suffix: '',      quality: 'major',         intervals: [0, 4, 7] },
  { suffix: 'm',     quality: 'minor',         intervals: [0, 3, 7] },
  { suffix: 'dim',   quality: 'diminished',    intervals: [0, 3, 6] },
  { suffix: 'aug',   quality: 'augmented',     intervals: [0, 4, 8] },
  { suffix: 'sus2',  quality: 'suspended2',    intervals: [0, 2, 7] },
  { suffix: 'sus4',  quality: 'suspended4',    intervals: [0, 5, 7] },
  { suffix: '5',     quality: 'power',         intervals: [0, 7] },
  // Tetrads
  { suffix: '7',     quality: 'dominant7',     intervals: [0, 4, 7, 10] },
  { suffix: 'maj7',  quality: 'major7',        intervals: [0, 4, 7, 11] },
  { suffix: 'm7',    quality: 'minor7',        intervals: [0, 3, 7, 10] },
  { suffix: 'dim7',  quality: 'diminished7',   intervals: [0, 3, 6, 9] },
  { suffix: 'm7b5',  quality: 'halfDiminished',intervals: [0, 3, 6, 10] },
  { suffix: 'aug7',  quality: 'augmented7',    intervals: [0, 4, 8, 10] },
  { suffix: 'add9',  quality: 'add9',          intervals: [0, 4, 7, 14] },
  // Extended (reduced to within one octave for matching)
  { suffix: '9',     quality: 'dominant9',     intervals: [0, 4, 7, 10, 2] },
  { suffix: 'maj9',  quality: 'major9',        intervals: [0, 4, 7, 11, 2] },
  { suffix: 'm9',    quality: 'minor9',        intervals: [0, 3, 7, 10, 2] },
]

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface ChordCandidate {
  /** Full chord name including root, e.g. "Am7" */
  name: string
  /** Root note of the chord */
  root: string
  /** Chord quality */
  quality: ChordQuality
  /**
   * Inversion number:
   * 0 = root position, 1 = first inversion (3rd in bass),
   * 2 = second inversion (5th in bass), 3 = third inversion (7th in bass)
   */
  inversion: number
  /**
   * Confidence score from 0 to 1.
   * 1 = all pattern notes present and no extra notes.
   * Decreases for extra (tension) notes or missing notes.
   */
  score: number
  /** The note names that were matched to this chord */
  matchedNotes: string[]
}

export interface DetectOptions {
  /** Accidental preference for note/chord names (default: 'sharp') */
  style?: NoteStyle
  /** Maximum number of candidates to return (default: 5) */
  maxCandidates?: number
  /** Minimum score threshold to include a candidate (default: 0.4) */
  minScore?: number
}

// ---------------------------------------------------------------------------
// Core detection engine
// ---------------------------------------------------------------------------

function normalizeIntervals(intervals: number[]): number[] {
  return intervals.map((i) => ((i % 12) + 12) % 12)
}

function scoreMatch(inputSet: Set<number>, pattern: number[]): number {
  const normalized = normalizeIntervals(pattern)
  const patternSet = new Set(normalized)

  let matched = 0
  for (const interval of patternSet) {
    if (inputSet.has(interval)) matched++
  }

  const coverage = matched / patternSet.size
  const extra = inputSet.size - matched
  const penaltyPerExtra = 0.08
  const score = Math.max(0, coverage - extra * penaltyPerExtra)
  return score
}

function detectFromChromaSet(chromaSet: number[], style: NoteStyle): ChordCandidate[] {
  if (chromaSet.length === 0) return []

  const candidates: ChordCandidate[] = []

  for (const rootChroma of chromaSet) {
    const relativeIntervals = new Set(
      chromaSet.map((c) => ((c - rootChroma + 12) % 12)),
    )

    for (const chordType of CHORD_TYPES) {
      const score = scoreMatch(relativeIntervals, chordType.intervals)
      if (score < 0.01) continue

      const root = noteName(rootChroma, style)
      const normalizedPattern = normalizeIntervals(chordType.intervals)

      // Detect inversion: which pattern note is in the bass (lowest chroma)?
      const bassChroma = chromaSet[0]
      const bassInterval = ((bassChroma - rootChroma + 12) % 12)
      const inversionIndex = normalizedPattern.indexOf(bassInterval)
      const inversion = inversionIndex <= 0 ? 0 : inversionIndex

      const matchedNotes = normalizedPattern
        .filter((i) => relativeIntervals.has(i))
        .map((i) => noteName(rootChroma + i, style))

      candidates.push({
        name: root + chordType.suffix,
        root,
        quality: chordType.quality,
        inversion,
        score,
        matchedNotes,
      })
    }
  }

  candidates.sort((a, b) => b.score - a.score)
  return candidates
}

// ---------------------------------------------------------------------------
// Public detection functions
// ---------------------------------------------------------------------------

/**
 * Detects possible chords from an array of note name strings.
 * Returns candidates sorted by confidence score (highest first).
 *
 * @example
 * detectChord(['A', 'C', 'E'])
 * // [{ name: 'Am', root: 'A', quality: 'minor', inversion: 0, score: 1, ... }]
 *
 * detectChord(['C', 'E', 'G', 'B'])
 * // [{ name: 'Cmaj7', score: 1 }, { name: 'Em', score: 0.7 }, ...]
 */
export function detectChord(notes: string[], options: DetectOptions = {}): ChordCandidate[] {
  const { style = 'sharp', maxCandidates = 5, minScore = 0.4 } = options
  const chromas = [...new Set(notes.map(noteIdx))]
  const results = detectFromChromaSet(chromas, style)
  return results.filter((c) => c.score >= minScore).slice(0, maxCandidates)
}

/**
 * Detects possible chords from an array of MIDI note numbers.
 * Notes are sorted by pitch to determine bass (lowest = first).
 *
 * @example
 * detectChordFromMidi([57, 60, 64])  // A3, C4, E4 → Am
 * detectChordFromMidi([60, 64, 67])  // C4, E4, G4 → C
 */
export function detectChordFromMidi(midiNumbers: number[], options: DetectOptions = {}): ChordCandidate[] {
  const { style = 'sharp' } = options
  const sorted = [...midiNumbers].sort((a, b) => a - b)
  const notes = sorted.map((m) => midiToNote(m, style).name)
  return detectChord(notes, options)
}

/**
 * Detects possible chords from an array of frequencies in Hz.
 * Each frequency is snapped to the nearest MIDI semitone.
 * Frequencies outside the MIDI range (approx 8–12544 Hz) are ignored.
 *
 * @example
 * // A3 (220 Hz), C4 (261.63 Hz), E4 (329.63 Hz) → Am
 * detectChordFromFrequencies([220, 261.63, 329.63])
 */
export function detectChordFromFrequencies(frequencies: number[], options: DetectOptions = {}): ChordCandidate[] {
  const { style = 'sharp' } = options
  const midiNumbers = frequencies
    .map(frequencyToMidi)
    .filter((m) => m >= 0)
  return detectChordFromMidi(midiNumbers, { ...options, style })
}
