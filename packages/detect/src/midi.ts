import { NOTES_SHARP as NOTE_NAMES_SHARP, NOTES_FLAT as NOTE_NAMES_FLAT, parseNoteOffset } from './notes'

export type NoteStyle = 'sharp' | 'flat'

export interface MidiNote {
  /** MIDI note number (0–127) */
  midi: number
  /** Note name without octave, e.g. "A#" */
  name: string
  /** Octave number (middle C = C4 = MIDI 60) */
  octave: number
  /** Frequency in Hz */
  frequency: number
}

/**
 * Converts a MIDI note number (0–127) to a MidiNote descriptor.
 * Middle C = MIDI 60 = C4.
 */
export function midiToNote(midi: number, style: NoteStyle = 'sharp'): MidiNote {
  const clamped = Math.max(0, Math.min(127, Math.round(midi)))
  const chroma = clamped % 12
  const octave = Math.floor(clamped / 12) - 1
  const names = style === 'flat' ? NOTE_NAMES_FLAT : NOTE_NAMES_SHARP
  const name = names[chroma]
  // A4 = MIDI 69 = 440 Hz
  const frequency = 440 * Math.pow(2, (clamped - 69) / 12)
  return { midi: clamped, name, octave, frequency }
}

/**
 * Converts a note name and octave to its MIDI number.
 * @example noteToMidi('A', 4) → 69
 */
export function noteToMidi(name: string, octave: number): number {
  // Unwrapped on purpose: B#4 is C5 and Cb4 is B3.
  const offset = parseNoteOffset(name)
  if (offset === null) return -1
  return (octave + 1) * 12 + offset
}
