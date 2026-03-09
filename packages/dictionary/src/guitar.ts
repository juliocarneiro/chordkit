import type { ChordDiagram } from 'chordkit'

/** Common open guitar chord voicings */
export const guitar: Record<string, ChordDiagram> = {
  C: {
    name: 'C',
    fingers: [
      { string: 2, fret: 1 },
      { string: 4, fret: 2 },
      { string: 5, fret: 3 },
    ],
    open: [1, 3],
    muted: [6],
  },
  D: {
    name: 'D',
    fingers: [
      { string: 1, fret: 2 },
      { string: 2, fret: 3 },
      { string: 3, fret: 2 },
    ],
    open: [4],
    muted: [5, 6],
  },
  Dm: {
    name: 'Dm',
    fingers: [
      { string: 1, fret: 1 },
      { string: 2, fret: 3 },
      { string: 3, fret: 2 },
    ],
    open: [4],
    muted: [5, 6],
  },
  E: {
    name: 'E',
    fingers: [
      { string: 3, fret: 1 },
      { string: 4, fret: 2 },
      { string: 5, fret: 2 },
    ],
    open: [1, 2, 6],
  },
  Em: {
    name: 'Em',
    fingers: [
      { string: 4, fret: 2 },
      { string: 5, fret: 2 },
    ],
    open: [1, 2, 3, 6],
  },
  F: {
    name: 'F',
    fingers: [
      { string: 3, fret: 2 },
      { string: 4, fret: 3 },
      { string: 5, fret: 3 },
    ],
    barres: [{ fret: 1, fromString: 1, toString: 6 }],
  },
  G: {
    name: 'G',
    fingers: [
      { string: 1, fret: 3 },
      { string: 5, fret: 2 },
      { string: 6, fret: 3 },
    ],
    open: [2, 3, 4],
  },
  A: {
    name: 'A',
    fingers: [
      { string: 2, fret: 2 },
      { string: 3, fret: 2 },
      { string: 4, fret: 2 },
    ],
    open: [1, 5],
    muted: [6],
  },
  Am: {
    name: 'Am',
    fingers: [
      { string: 2, fret: 1 },
      { string: 3, fret: 2 },
      { string: 4, fret: 2 },
    ],
    open: [1, 5],
    muted: [6],
  },
  B: {
    name: 'B',
    fingers: [
      { string: 2, fret: 4 },
      { string: 3, fret: 4 },
      { string: 4, fret: 4 },
    ],
    barres: [{ fret: 2, fromString: 1, toString: 5 }],
    muted: [6],
    position: 1,
  },
  Bm: {
    name: 'Bm',
    fingers: [
      { string: 3, fret: 3 },
      { string: 4, fret: 4 },
      { string: 5, fret: 4 },
    ],
    barres: [{ fret: 2, fromString: 1, toString: 5 }],
    muted: [6],
    position: 1,
  },
  C7: {
    name: 'C7',
    fingers: [
      { string: 2, fret: 1 },
      { string: 4, fret: 2 },
      { string: 5, fret: 3 },
    ],
    open: [1, 3],
    muted: [6],
  },
  D7: {
    name: 'D7',
    fingers: [
      { string: 1, fret: 2 },
      { string: 2, fret: 1 },
      { string: 3, fret: 2 },
    ],
    open: [4],
    muted: [5, 6],
  },
  E7: {
    name: 'E7',
    fingers: [
      { string: 3, fret: 1 },
      { string: 5, fret: 2 },
    ],
    open: [1, 2, 4, 6],
  },
  G7: {
    name: 'G7',
    fingers: [
      { string: 1, fret: 1 },
      { string: 5, fret: 2 },
      { string: 6, fret: 3 },
    ],
    open: [2, 3, 4],
  },
  A7: {
    name: 'A7',
    fingers: [
      { string: 2, fret: 2 },
      { string: 4, fret: 2 },
    ],
    open: [1, 3, 5],
    muted: [6],
  },
  Am7: {
    name: 'Am7',
    fingers: [
      { string: 2, fret: 1 },
      { string: 3, fret: 2 },
    ],
    open: [1, 4, 5],
    muted: [6],
  },
  Dm7: {
    name: 'Dm7',
    fingers: [
      { string: 1, fret: 1 },
      { string: 2, fret: 1 },
      { string: 3, fret: 2 },
    ],
    open: [4],
    muted: [5, 6],
  },
  Em7: {
    name: 'Em7',
    fingers: [
      { string: 4, fret: 2 },
    ],
    open: [1, 2, 3, 5, 6],
  },
}
