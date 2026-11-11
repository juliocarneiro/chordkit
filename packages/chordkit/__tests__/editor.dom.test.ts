// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ChordEditor } from '../src/interactive'
import { ChordChart } from '../src/ChordChart'
import type { ChordDiagram } from '../src/types'

const F: ChordDiagram = {
  name: 'F',
  fingers: [
    { string: 3, fret: 2 },
    { string: 4, fret: 3 },
    { string: 5, fret: 3 },
  ],
  barres: [{ fret: 1, fromString: 1, toString: 6 }],
  position: 3,
}

let host: HTMLDivElement

beforeEach(() => {
  document.body.innerHTML = ''
  host = document.createElement('div')
  host.id = 'host'
  document.body.appendChild(host)
})

const hit = (key: string) => host.querySelector<SVGElement>(`[data-ck-hit="${key}"]`)!
const click = (el: Element) => el.dispatchEvent(new MouseEvent('click', { bubbles: true }))

describe('ChordEditor in the DOM', () => {
  it('accepts an element as well as a selector', () => {
    new ChordEditor(host)
    expect(host.querySelector('svg')).not.toBeNull()
  })

  it('keeps name, barres and position of a loaded chord', () => {
    const editor = new ChordEditor(host, { initialChord: F })
    const chord = editor.getChord()
    expect(chord.name).toBe('F')
    expect(chord.barres).toEqual(F.barres)
    expect(chord.position).toBe(3)
  })

  it('renders the loaded chord at its position', () => {
    new ChordEditor(host, { initialChord: F })
    expect(host.textContent).toContain('3fr')
  })

  it('places a finger when a fret is clicked and removes it on the second click', () => {
    const onChange = vi.fn()
    const editor = new ChordEditor(host, { onChange })
    click(hit('2-1'))
    expect(editor.getChord().fingers).toEqual([{ string: 2, fret: 1 }])
    click(hit('2-1'))
    expect(editor.getChord().fingers).toEqual([])
    expect(onChange).toHaveBeenCalledTimes(2)
  })

  it('places fingers in horizontal orientation too', () => {
    const editor = new ChordEditor(host, { orientation: 'horizontal' })
    click(hit('3-2'))
    expect(editor.getChord().fingers).toEqual([{ string: 3, fret: 2 }])
  })

  it('cycles a string through open, muted and normal', () => {
    const editor = new ChordEditor(host)
    click(hit('6-0'))
    expect(editor.getChord().open).toEqual([6])
    click(hit('6-0'))
    expect(editor.getChord().muted).toEqual([6])
    click(hit('6-0'))
    expect(editor.getChord().muted).toBeUndefined()
  })

  it('can be operated from the keyboard', () => {
    const editor = new ChordEditor(host)
    const target = hit('2-1')
    expect(target.getAttribute('tabindex')).toBe('0')
    expect(target.getAttribute('role')).toBe('button')
    expect(target.getAttribute('aria-label')).toMatch(/string 2.*fret 1/i)
    target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    expect(editor.getChord().fingers).toEqual([{ string: 2, fret: 1 }])
  })

  it('keeps keyboard focus on the same position after a re-render', () => {
    new ChordEditor(host)
    hit('2-1').focus()
    hit('2-1').dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }))
    expect(document.activeElement).toBe(hit('2-1'))
  })

  it('applies option changes with setOptions', () => {
    const editor = new ChordEditor(host, { theme: 'light' })
    editor.setOptions({ theme: 'dark' })
    expect(host.querySelector('svg rect')!.getAttribute('fill')).toBe('#1a1a2e')
  })

  it('destroy empties the container and stops reacting', () => {
    const editor = new ChordEditor(host)
    editor.destroy()
    expect(host.innerHTML).toBe('')
    editor.setChord({ fingers: [{ string: 1, fret: 1 }] })
    expect(host.innerHTML).toBe('')
  })
})

describe('ChordChart DOM target', () => {
  it('draws into an element passed to the constructor', () => {
    new ChordChart(host).chord({ fingers: [] }).draw()
    expect(host.querySelector('svg')).not.toBeNull()
  })

  it('throws when the selector matches nothing', () => {
    expect(() => new ChordChart('#missing').chord({ fingers: [] }).draw()).toThrow(/#missing/)
  })
})
