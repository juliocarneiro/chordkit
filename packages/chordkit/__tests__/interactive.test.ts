import { describe, it, expect } from 'vitest'
import { ChordEditor } from '../src/interactive'
import type { ChordDiagram } from '../src/types'

describe('ChordEditor (logic only, no DOM)', () => {
  it('can be constructed without DOM', () => {
    const editor = new ChordEditor('#test')
    expect(editor).toBeDefined()
  })

  it('returns empty chord when nothing is set', () => {
    const editor = new ChordEditor('#test')
    const chord = editor.getChord()
    expect(chord.fingers).toEqual([])
  })

  it('loads an initial chord and returns it', () => {
    const initial: ChordDiagram = {
      fingers: [
        { string: 2, fret: 1 },
        { string: 3, fret: 2 },
      ],
      open: [1],
      muted: [6],
    }
    const editor = new ChordEditor('#test', { initialChord: initial })
    const chord = editor.getChord()
    expect(chord.fingers).toHaveLength(2)
    expect(chord.open).toEqual([1])
    expect(chord.muted).toEqual([6])
  })

  it('setChord replaces the current chord', () => {
    const editor = new ChordEditor('#test')
    editor.setChord({
      fingers: [{ string: 1, fret: 3 }],
      open: [2],
    })
    const chord = editor.getChord()
    expect(chord.fingers).toHaveLength(1)
    expect(chord.fingers[0].string).toBe(1)
    expect(chord.fingers[0].fret).toBe(3)
    expect(chord.open).toEqual([2])
  })

  it('clear removes all fingers and states', () => {
    const editor = new ChordEditor('#test', {
      initialChord: {
        fingers: [{ string: 2, fret: 1 }],
        muted: [6],
      },
    })
    editor.clear()
    const chord = editor.getChord()
    expect(chord.fingers).toHaveLength(0)
    expect(chord.muted).toBeUndefined()
  })
})
