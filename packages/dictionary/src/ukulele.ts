import type { ChordDiagram } from 'chordkit'

/** Common ukulele chord voicings */
export const ukulele: Record<string, ChordDiagram> = {
  C: {
    name: 'C',
    fingers: [{ string: 1, fret: 3 }],
    open: [2, 3, 4],
  },
  Cm: {
    name: 'Cm',
    fingers: [
      { string: 1, fret: 3 },
      { string: 2, fret: 3 },
      { string: 3, fret: 3 },
    ],
    open: [4],
  },
  D: {
    name: 'D',
    fingers: [
      { string: 1, fret: 2 },
      { string: 2, fret: 2 },
      { string: 3, fret: 2 },
    ],
    open: [4],
  },
  Dm: {
    name: 'Dm',
    fingers: [
      { string: 1, fret: 1 },
      { string: 2, fret: 2 },
      { string: 3, fret: 2 },
    ],
    open: [4],
  },
  E: {
    name: 'E',
    fingers: [
      { string: 1, fret: 2 },
      { string: 3, fret: 1 },
      { string: 4, fret: 2 },
    ],
    open: [2],
  },
  Em: {
    name: 'Em',
    fingers: [
      { string: 1, fret: 2 },
      { string: 2, fret: 3 },
      { string: 3, fret: 4 },
    ],
    open: [4],
  },
  F: {
    name: 'F',
    fingers: [
      { string: 2, fret: 1 },
      { string: 4, fret: 2 },
    ],
    open: [1, 3],
  },
  G: {
    name: 'G',
    fingers: [
      { string: 1, fret: 2 },
      { string: 2, fret: 3 },
      { string: 3, fret: 2 },
    ],
    open: [4],
  },
  Gm: {
    name: 'Gm',
    fingers: [
      { string: 1, fret: 1 },
      { string: 2, fret: 3 },
      { string: 3, fret: 2 },
    ],
    open: [4],
  },
  A: {
    name: 'A',
    fingers: [
      { string: 3, fret: 1 },
      { string: 4, fret: 2 },
    ],
    open: [1, 2],
  },
  Am: {
    name: 'Am',
    fingers: [{ string: 4, fret: 2 }],
    open: [1, 2, 3],
  },
  B: {
    name: 'B',
    fingers: [
      { string: 1, fret: 2 },
      { string: 2, fret: 2 },
      { string: 3, fret: 2 },
      { string: 4, fret: 2 },
    ],
  },
  Bm: {
    name: 'Bm',
    fingers: [
      { string: 1, fret: 2 },
      { string: 2, fret: 2 },
      { string: 3, fret: 2 },
      { string: 4, fret: 2 },
    ],
  },
}
