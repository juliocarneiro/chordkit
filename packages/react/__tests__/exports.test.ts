import { describe, it, expect } from 'vitest'
import * as ReactPkg from '../src/index'

describe('@chordkit/react exports', () => {
  it('exports ChordChart component', () => {
    expect(typeof ReactPkg.ChordChart).toBe('function')
  })

  it('exports ChordProgression component', () => {
    expect(typeof ReactPkg.ChordProgression).toBe('function')
  })

  it('exports ChordEditor component', () => {
    expect(typeof ReactPkg.ChordEditor).toBe('function')
  })

  it('exports useChordEditor hook', () => {
    expect(typeof ReactPkg.useChordEditor).toBe('function')
  })
})
