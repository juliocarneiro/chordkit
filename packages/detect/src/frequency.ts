import { midiToNote } from './midi'
import type { MidiNote, NoteStyle } from './midi'

/**
 * Converts a frequency in Hz to the nearest MIDI note number.
 * Returns -1 if frequency is out of the audible/MIDI range.
 */
export function frequencyToMidi(hz: number): number {
  if (hz <= 0) return -1
  const midi = 69 + 12 * Math.log2(hz / 440)
  const rounded = Math.round(midi)
  if (rounded < 0 || rounded > 127) return -1
  return rounded
}

/**
 * Converts a frequency in Hz to a MidiNote descriptor (nearest semitone).
 * Returns null if the frequency is outside the MIDI range (approx 8–12544 Hz).
 */
export function frequencyToNote(hz: number, style: NoteStyle = 'sharp'): MidiNote | null {
  const midi = frequencyToMidi(hz)
  if (midi === -1) return null
  return midiToNote(midi, style)
}

/**
 * Returns how many cents (1/100 semitone) a frequency deviates from its nearest semitone.
 * Positive = sharp, negative = flat.
 */
export function centDeviation(hz: number): number {
  if (hz <= 0) return 0
  const exactMidi = 69 + 12 * Math.log2(hz / 440)
  return Math.round((exactMidi - Math.round(exactMidi)) * 100)
}
