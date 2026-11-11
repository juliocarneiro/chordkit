import { describe, it, expect, vi } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { ChordEditor } from '../src/ChordEditor'
import type { ChordDiagram } from 'chordkit'

const AM: ChordDiagram = {
  name: 'Am',
  fingers: [{ string: 2, fret: 1 }, { string: 3, fret: 2 }, { string: 4, fret: 2 }],
  open: [1, 5],
  muted: [6],
}

const dots = (el: HTMLElement) => el.querySelectorAll('circle[filter]').length
const background = (el: HTMLElement) => el.querySelector('svg rect')?.getAttribute('fill')

async function mounted(el: HTMLElement) {
  await waitFor(() => expect(el.querySelector('svg')).not.toBeNull())
}

describe('<ChordEditor>', () => {
  it('shows initialChord as soon as the editor mounts', async () => {
    const { container } = render(<ChordEditor initialChord={AM} />)
    await mounted(container)
    expect(dots(container)).toBe(3)
  })

  it('does not report the initial chord as a user change', async () => {
    const onChange = vi.fn()
    const { container } = render(<ChordEditor initialChord={AM} onChange={onChange} />)
    await mounted(container)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('loads a new initialChord when the prop changes', async () => {
    const { container, rerender } = render(<ChordEditor initialChord={AM} />)
    await mounted(container)
    rerender(<ChordEditor initialChord={{ fingers: [{ string: 1, fret: 1 }] }} />)
    await waitFor(() => expect(dots(container)).toBe(1))
  })

  it('applies a theme change after mount', async () => {
    const { container, rerender } = render(<ChordEditor theme="light" />)
    await mounted(container)
    expect(background(container)).toBe('#ffffff')
    rerender(<ChordEditor theme="dark" />)
    await waitFor(() => expect(background(container)).toBe('#1a1a2e'))
  })

  it('reports user clicks through onChange', async () => {
    const onChange = vi.fn()
    const { container } = render(<ChordEditor onChange={onChange} />)
    await mounted(container)
    container.querySelector('[data-ck-hit="2-1"]')!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(onChange).toHaveBeenCalledWith({ fingers: [{ string: 2, fret: 1 }] })
  })

  it('removes the editor markup on unmount', async () => {
    const { container, unmount } = render(<ChordEditor />)
    await mounted(container)
    const host = container.firstElementChild as HTMLElement
    unmount()
    expect(host.innerHTML).toBe('')
  })
})
