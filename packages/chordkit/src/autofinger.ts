import type { Barre, ChordDiagram, Finger } from './types'

function isUnderBarre(finger: Finger, barres: Barre[]): boolean {
  return barres.some((b) => {
    const from = Math.min(b.fromString, b.toString)
    const to = Math.max(b.fromString, b.toString)
    return b.fret === finger.fret && finger.string >= from && finger.string <= to
  })
}

/**
 * Automatically assign finger numbers (1-4) to chord positions using
 * ergonomic heuristics based on fret/string positions.
 *
 * - A barre uses finger 1 (index), and so does any dot lying under it
 * - The other dots are numbered in fret order (lowest first); on a shared fret
 *   the lower-pitched string gets the lower finger
 * - Numbering starts at 1, or at 2 when a barre already takes the index finger
 * - With more dots than fingers the remaining ones repeat finger 4
 *
 * Returns a new ChordDiagram with `finger.text` populated, in the original order.
 * Fingers that already have explicit `text` are left unchanged.
 */
export function autoFinger(chord: ChordDiagram): ChordDiagram {
  const barres = chord.barres ?? []
  const assigned = new Map<Finger, string>()

  const free = chord.fingers
    .filter((f) => !isUnderBarre(f, barres))
    .sort((a, b) => (a.fret !== b.fret ? a.fret - b.fret : b.string - a.string))

  let nextFinger = barres.length > 0 ? 2 : 1
  for (const finger of free) {
    if (finger.text) continue
    assigned.set(finger, String(Math.min(nextFinger, 4)))
    nextFinger++
  }

  const fingers = chord.fingers.map((f) => {
    if (f.text) return f
    return { ...f, text: assigned.get(f) ?? '1' }
  })

  return {
    ...chord,
    fingers,
    barres: barres.length > 0 ? barres.map((b) => ({ ...b, text: b.text ?? '1' })) : chord.barres,
  }
}
