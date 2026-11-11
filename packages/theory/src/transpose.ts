import type { Barre, ChordDiagram, Finger, InstrumentPreset, InstrumentConfig } from 'chordkit'
import { accidentalOf, noteIndex, noteFromIndex } from './notes'
import type { NoteStyle } from './notes'

/** Frets shown by every built-in instrument preset */
const DEFAULT_VISIBLE_FRETS = 5

function visibleFrets(instrument?: InstrumentPreset | InstrumentConfig): number {
  return typeof instrument === 'object' && instrument.frets > 0 ? instrument.frets : DEFAULT_VISIBLE_FRETS
}

const mod12 = (n: number) => ((n % 12) + 12) % 12

function transposeName(name: string, semitones: number, style?: NoteStyle): string {
  const rootMatch = name.match(/^[A-G][#b]?/)
  if (!rootMatch) return name
  // Decide from the root alone: the "b" in "Cm7b5" says nothing about the key.
  const resolvedStyle: NoteStyle = style ?? accidentalOf(rootMatch[0]) ?? 'sharp'
  const shift = (note: string) => noteFromIndex(noteIndex(note) + semitones, resolvedStyle)
  return name
    .replace(/^[A-G][#b]?/, shift)
    .replace(/\/([A-G][#b]?)$/, (_, bass: string) => `/${shift(bass)}`)
}

/**
 * Transposes a ChordDiagram by the given number of semitones.
 *
 * The whole shape slides along the neck, so every string moves by the same interval
 * and the result is the same chord quality in the new key:
 *
 * - Open strings cannot stay open when the shape moves up; they are covered by a
 *   barre (or a single finger) at the new fret.
 * - A finger or barre that lands on the nut becomes open strings.
 * - The shape is kept as low on the neck as possible. Transposing down past the
 *   nut wraps up an octave instead.
 * - `position` is set so that the fret numbers fit the diagram (frets stay relative to it).
 *
 * @param chord - The source chord diagram
 * @param semitones - Positive = up, negative = down
 * @param instrument - Instrument preset or config; only its fret count is used (default: 5 frets)
 * @param style - Accidental style for the transposed chord name
 */
export function transpose(
  chord: ChordDiagram,
  semitones: number,
  instrument?: InstrumentPreset | InstrumentConfig,
  style?: NoteStyle,
): ChordDiagram {
  if (semitones === 0) return chord

  const result: ChordDiagram = { ...chord }
  if (chord.name) result.name = transposeName(chord.name, semitones, style)

  const offset = (chord.position ?? 1) - 1
  const open = chord.open ?? []
  const muted = new Set(chord.muted ?? [])

  // Work in absolute frets (0 = open string).
  const absFingers = chord.fingers.map((f) => ({ ...f, fret: f.fret + offset }))
  const absBarres = (chord.barres ?? []).map((b) => ({ ...b, fret: b.fret + offset }))
  const frettedFrets = [...absFingers, ...absBarres].map((x) => x.fret)

  if (frettedFrets.length === 0 && open.length === 0) return result

  const lowest = open.length > 0 ? 0 : Math.min(...frettedFrets)
  let shift = mod12(semitones)
  if (lowest + shift - 12 >= 0) shift -= 12

  let fingers: Finger[] = absFingers.map((f) => ({ ...f, fret: f.fret + shift }))
  let barres: Barre[] = absBarres.map((b) => ({ ...b, fret: b.fret + shift }))
  const newOpen = new Set<number>()

  if (shift === 0) {
    open.forEach((s) => newOpen.add(s))
  } else if (open.length === 1) {
    fingers.push({ string: open[0], fret: shift })
  } else if (open.length > 1) {
    barres.unshift({ fret: shift, fromString: Math.min(...open), toString: Math.max(...open) })
  }

  // Anything that landed on the nut is an open string again.
  const stillFretted = new Set(fingers.filter((f) => f.fret > 0).map((f) => f.string))
  for (const f of fingers) {
    if (f.fret === 0 && !stillFretted.has(f.string)) newOpen.add(f.string)
  }
  for (const b of barres) {
    if (b.fret !== 0) continue
    const from = Math.min(b.fromString, b.toString)
    const to = Math.max(b.fromString, b.toString)
    for (let s = from; s <= to; s++) {
      if (!stillFretted.has(s) && !muted.has(s)) newOpen.add(s)
    }
  }
  fingers = fingers.filter((f) => f.fret > 0)
  barres = barres.filter((b) => b.fret > 0)

  // Choose a starting position that keeps the shape inside the diagram.
  const frets = [...fingers, ...barres].map((x) => x.fret)
  const position = frets.length > 0 && Math.max(...frets) > visibleFrets(instrument) ? Math.min(...frets) : 1
  const relative = position - 1

  result.fingers = fingers.map((f) => ({ ...f, fret: f.fret - relative }))
  result.position = position

  if (barres.length > 0) result.barres = barres.map((b) => ({ ...b, fret: b.fret - relative }))
  else delete result.barres

  if (newOpen.size > 0) result.open = [...newOpen].sort((a, b) => a - b)
  else delete result.open

  return result
}
