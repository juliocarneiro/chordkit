import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChordChart } from '../src/ChordChart'
import type { ChordDiagram } from 'chordkit'

const AM: ChordDiagram = {
  name: 'Am',
  fingers: [
    { string: 2, fret: 1 },
    { string: 3, fret: 2 },
    { string: 4, fret: 2 },
  ],
  muted: [6],
  open: [1, 5],
}

describe('ChordChart', () => {
  it('renders an SVG element', () => {
    const { container } = render(<ChordChart chord={AM} />)
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('includes the chord name in the output', () => {
    const { container } = render(<ChordChart chord={AM} />)
    expect(container.innerHTML).toContain('Am')
  })

  it('applies className to the wrapper div', () => {
    const { container } = render(<ChordChart chord={AM} className="my-class" />)
    expect(container.firstElementChild?.className).toBe('my-class')
  })

  it('applies inline style to the wrapper div', () => {
    const { container } = render(<ChordChart chord={AM} style={{ display: 'inline-block' }} />)
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.style.display).toBe('inline-block')
  })

  it('renders with dark theme', () => {
    const { container } = render(<ChordChart chord={AM} theme="dark" />)
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('renders without crashing when optional props are omitted', () => {
    expect(() => render(<ChordChart chord={AM} />)).not.toThrow()
  })
})
