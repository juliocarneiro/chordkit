import type { ChordDiagram, InstrumentConfig } from './types'

/** Generate an accessible title for the chord diagram */
export function generateAriaTitle(chord: ChordDiagram): string {
  if (chord.name) {
    return `Chord diagram: ${chord.name}`
  }
  return 'Chord diagram'
}

/** Generate a full textual description of the chord for screen readers */
export function generateAriaDescription(
  chord: ChordDiagram,
  instrument: InstrumentConfig,
): string {
  const parts: string[] = []

  if (chord.name) {
    parts.push(`${chord.name} chord`)
  }

  parts.push(`${instrument.strings}-string instrument`)

  if (chord.position && chord.position > 1) {
    parts.push(`starting at fret ${chord.position}`)
  }

  if (chord.muted?.length) {
    const mutedStr = chord.muted.map((s) => `string ${s}`).join(', ')
    parts.push(`muted: ${mutedStr}`)
  }

  if (chord.open?.length) {
    const openStr = chord.open.map((s) => `string ${s}`).join(', ')
    parts.push(`open: ${openStr}`)
  }

  if (chord.fingers.length) {
    const fingerStr = chord.fingers
      .map((f) => `string ${f.string} fret ${f.fret}`)
      .join(', ')
    parts.push(`fingers: ${fingerStr}`)
  }

  if (chord.barres?.length) {
    const barreStr = chord.barres
      .map((b) => `barre on fret ${b.fret} from string ${b.fromString} to ${b.toString}`)
      .join(', ')
    parts.push(barreStr)
  }

  return parts.join('. ') + '.'
}
