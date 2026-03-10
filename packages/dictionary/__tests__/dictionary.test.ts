import { describe, it, expect } from 'vitest'
import { guitar, ukulele } from '../src/index'

describe('guitar dictionary', () => {
  it('exports chord objects with fingers array', () => {
    expect(Array.isArray(guitar.Am.fingers)).toBe(true)
    expect(Array.isArray(guitar.G.fingers)).toBe(true)
    expect(Array.isArray(guitar.F.fingers)).toBe(true)
  })

  it('Am has the expected finger positions', () => {
    const am = guitar.Am
    expect(am.name).toBe('Am')
    expect(am.fingers.length).toBeGreaterThan(0)
  })

  it('F has barre definition', () => {
    const f = guitar.F
    expect(f.barres).toBeDefined()
    expect(f.barres!.length).toBeGreaterThan(0)
  })

  it('exports all expected major chords', () => {
    for (const name of ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const) {
      expect(guitar[name]).toBeDefined()
      expect(guitar[name].fingers).toBeDefined()
    }
  })
})

describe('ukulele dictionary', () => {
  it('exports chord objects with fingers array', () => {
    expect(Array.isArray(ukulele.C.fingers)).toBe(true)
    expect(Array.isArray(ukulele.Am.fingers)).toBe(true)
  })

  it('C chord has a name', () => {
    expect(ukulele.C.name).toBe('C')
  })
})
