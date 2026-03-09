import type { ChordDiagram, InstrumentPreset, InstrumentConfig } from 'chordkit'
import { noteIndex, noteFromIndex } from './notes'
import type { NoteStyle } from './notes'

const INSTRUMENT_TUNINGS: Record<InstrumentPreset, string[]> = {
  guitar:     ['E', 'A', 'D', 'G', 'B', 'E'],
  ukulele:    ['G', 'C', 'E', 'A'],
  bass:       ['E', 'A', 'D', 'G'],
  banjo:      ['G', 'D', 'G', 'B', 'D'],
  cavaquinho: ['D', 'G', 'B', 'E'],
}

function resolveTuning(instrument?: InstrumentPreset | InstrumentConfig): string[] {
  if (!instrument) return INSTRUMENT_TUNINGS.guitar
  if (typeof instrument === 'string') return INSTRUMENT_TUNINGS[instrument] ?? INSTRUMENT_TUNINGS.guitar
  return instrument.tuning ?? INSTRUMENT_TUNINGS.guitar
}

/**
 * Transposes a ChordDiagram by the given number of semitones.
 *
 * The function recalculates finger positions on the fretboard by:
 * 1. Finding the absolute note at each finger position (open tuning + fret + chord position)
 * 2. Shifting the note by the desired semitones
 * 3. Finding the new fret on the same string that produces that note
 *
 * When no single fret position is possible (the transposed note is below the open string),
 * the function returns the chord with an adjusted `position` (capo offset).
 *
 * @param chord - The source chord diagram
 * @param semitones - Positive = up, negative = down
 * @param instrument - Instrument preset or config (default: 'guitar')
 * @param style - Accidental style for the transposed chord name
 */
export function transpose(
  chord: ChordDiagram,
  semitones: number,
  instrument?: InstrumentPreset | InstrumentConfig,
  style?: NoteStyle,
): ChordDiagram {
  if (semitones === 0) return chord

  const tuning = resolveTuning(instrument)
  const totalStrings = tuning.length
  const position = chord.position ?? 1

  const transposeFret = (stringNum: number, fret: number): number => {
    const tuningIdx = totalStrings - stringNum
    const openNote = tuning[tuningIdx] ?? 'E'
    const absoluteFret = fret + (position - 1)
    const currentNoteIdx = (noteIndex(openNote) + absoluteFret) % 12
    const targetNoteIdx = ((currentNoteIdx + semitones) % 12 + 12) % 12
    const openNoteIdx = noteIndex(openNote)
    let newFret = ((targetNoteIdx - openNoteIdx) % 12 + 12) % 12
    if (newFret === 0 && fret > 0) newFret = 12
    return newFret
  }

  const newFingers = chord.fingers.map((f) => ({
    ...f,
    fret: transposeFret(f.string, f.fret),
  }))

  const newBarres = (chord.barres ?? []).map((b) => ({
    ...b,
    fret: transposeFret(b.fromString, b.fret),
  }))

  let newName = chord.name
  if (chord.name) {
    const resolvedStyle: NoteStyle = style ?? (chord.name.includes('b') ? 'flat' : 'sharp')
    const rootMatch = chord.name.match(/^([A-G][#b]?)/)
    if (rootMatch) {
      const oldRoot = rootMatch[1]
      const newRoot = noteFromIndex(noteIndex(oldRoot) + semitones, resolvedStyle)
      newName = chord.name.replace(oldRoot, newRoot)
    }
  }

  return {
    ...chord,
    name: newName,
    fingers: newFingers,
    barres: newBarres.length > 0 ? newBarres : chord.barres,
    position: 1,
  }
}
