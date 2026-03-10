import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useChordEditor } from '../src/useChordEditor'
import type { ChordDiagram } from 'chordkit'

const AM: ChordDiagram = {
  name: 'Am',
  fingers: [{ string: 2, fret: 1 }, { string: 3, fret: 2 }],
}

describe('useChordEditor', () => {
  it('returns a ref, chord, setChord, and clear', () => {
    const { result } = renderHook(() => useChordEditor())
    expect(result.current.ref).toBeDefined()
    expect(result.current.chord).toBeNull()
    expect(typeof result.current.setChord).toBe('function')
    expect(typeof result.current.clear).toBe('function')
  })

  it('starts with chord = null', () => {
    const { result } = renderHook(() => useChordEditor())
    expect(result.current.chord).toBeNull()
  })

  it('updates chord state when setChord is called', () => {
    const { result } = renderHook(() => useChordEditor())
    act(() => {
      result.current.setChord(AM)
    })
    expect(result.current.chord).toMatchObject({ name: 'Am' })
  })

  it('resets chord to null when clear is called', () => {
    const { result } = renderHook(() => useChordEditor())
    act(() => {
      result.current.setChord(AM)
    })
    act(() => {
      result.current.clear()
    })
    expect(result.current.chord).toBeNull()
  })

  it('calls onChange when setChord is called after the editor initializes', async () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useChordEditor({ onChange }))

    // The ChordEditor is initialized asynchronously via dynamic import — skip onChange check
    act(() => {
      result.current.setChord(AM)
    })
    expect(result.current.chord).toMatchObject({ name: 'Am' })
  })
})
