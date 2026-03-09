import { describe, it, expect } from 'vitest'
import { generateAnimationCSS, resolveAnimation } from '../src/animation'

describe('resolveAnimation', () => {
  it('returns null when input is falsy', () => {
    expect(resolveAnimation(undefined)).toBeNull()
    expect(resolveAnimation(false)).toBeNull()
  })

  it('returns defaults when input is true', () => {
    const result = resolveAnimation(true)
    expect(result).not.toBeNull()
    expect(result!.duration).toBe(800)
    expect(result!.stagger).toBe(100)
    expect(result!.direction).toBe('down')
    expect(result!.loop).toBe(false)
  })

  it('merges custom options with defaults', () => {
    const result = resolveAnimation({ duration: 1200, loop: true })
    expect(result!.duration).toBe(1200)
    expect(result!.loop).toBe(true)
    expect(result!.stagger).toBe(100)
  })
})

describe('generateAnimationCSS', () => {
  it('generates valid CSS with <style> tags', () => {
    const css = generateAnimationCSS(3, 0, { duration: 800, stagger: 100, direction: 'down', loop: false })
    expect(css).toContain('<style>')
    expect(css).toContain('</style>')
    expect(css).toContain('@keyframes ck-pop')
  })

  it('generates classes for each finger dot', () => {
    const css = generateAnimationCSS(3, 0, { duration: 800, stagger: 100, direction: 'down', loop: false })
    expect(css).toContain('.ck-dot-0')
    expect(css).toContain('.ck-dot-1')
    expect(css).toContain('.ck-dot-2')
  })

  it('generates classes for barre chords', () => {
    const css = generateAnimationCSS(2, 1, { duration: 800, stagger: 100, direction: 'down', loop: false })
    expect(css).toContain('.ck-barre-0')
    expect(css).toContain('@keyframes ck-barre-grow')
  })

  it('uses infinite iteration when loop is true', () => {
    const css = generateAnimationCSS(1, 0, { duration: 800, stagger: 100, direction: 'down', loop: true })
    expect(css).toContain('infinite')
  })

  it('reverses delay order for up direction', () => {
    const cssDown = generateAnimationCSS(3, 0, { duration: 800, stagger: 100, direction: 'down', loop: false })
    const cssUp = generateAnimationCSS(3, 0, { duration: 800, stagger: 100, direction: 'up', loop: false })
    expect(cssDown).not.toBe(cssUp)
  })
})
