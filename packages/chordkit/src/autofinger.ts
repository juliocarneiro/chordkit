import type { ChordDiagram, Finger } from './types'

/**
 * Automatically assign finger numbers (1-4) to chord positions using
 * ergonomic heuristics based on fret/string positions.
 *
 * - Barre chords always use finger 1 (index)
 * - Remaining fingers are assigned 2, 3, 4 in fret order (lowest first),
 *   then by string order (highest pitch first) within the same fret.
 *
 * Returns a new ChordDiagram with `finger.text` populated.
 * Fingers that already have explicit `text` are left unchanged.
 */
export function autoFinger(chord: ChordDiagram): ChordDiagram {
  const barreFrets = new Set((chord.barres ?? []).map((b) => b.fret))

  const barreAnnotated = (chord.barres ?? []).map((b) => ({
    ...b,
    text: b.text ?? '1',
  }))

  const withoutBarreFret = chord.fingers.filter((f) => !barreFrets.has(f.fret))
  const onBarreFret = chord.fingers.filter((f) => barreFrets.has(f.fret))

  const sorted = [...withoutBarreFret].sort((a, b) => {
    if (a.fret !== b.fret) return a.fret - b.fret
    return a.string - b.string
  })

  let nextFinger = 2
  const assignedFingers: Finger[] = sorted.map((f) => {
    if (f.text) return f
    const num = Math.min(nextFinger, 4)
    nextFinger++
    return { ...f, text: String(num) }
  })

  const barreFingers: Finger[] = onBarreFret.map((f) => {
    if (f.text) return f
    return { ...f, text: '1' }
  })

  return {
    ...chord,
    fingers: [...barreFingers, ...assignedFingers],
    barres: barreAnnotated.length > 0 ? barreAnnotated : chord.barres,
  }
}
