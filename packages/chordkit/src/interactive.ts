import type {
  Barre,
  ChordDiagram,
  Finger,
  InstrumentPreset,
  InstrumentConfig,
  ThemeInput,
  ChordChartOptions,
} from './types'
import { resolveConfig } from './defaults'
import { render } from './renderer'
import { resolveInstrument } from './presets'
import { computeLayout, pointOnString, fretCenter, INDICATOR_SPACE } from './layout'

type StringState = 'normal' | 'open' | 'muted'

export interface ChordEditorOptions {
  /** Instrument preset or custom config */
  instrument?: InstrumentPreset | InstrumentConfig
  /** Theme */
  theme?: ThemeInput
  /** Left-handed mode */
  leftHanded?: boolean
  /** Orientation of the diagram */
  orientation?: 'vertical' | 'horizontal'
  /** Callback fired whenever the chord changes */
  onChange?: (chord: ChordDiagram) => void
  /** Initial chord to load */
  initialChord?: ChordDiagram
  /** Width of the editor */
  width?: number
}

const HIT_ATTR = 'data-ck-hit'

/**
 * Interactive chord editor that renders into a DOM element.
 * Click (or focus and press Enter/Space) on a fret to place/remove a finger.
 * Do the same above a string to cycle it through open, muted and normal.
 * Browser-only: without a DOM it still tracks chord state, but renders nothing.
 */
export class ChordEditor {
  private _container: Element | null = null
  private _options: ChordEditorOptions
  private _fingers: Map<string, Finger> = new Map()
  private _stringStates: Map<number, StringState> = new Map()
  private _name: string | undefined
  private _barres: Barre[] | undefined
  private _position: number | undefined
  private _destroyed = false

  /**
   * @param target - CSS selector or the element to render into
   */
  constructor(target: string | Element, options: ChordEditorOptions = {}) {
    this._options = { ...options }

    if (options.initialChord) {
      this._loadChord(options.initialChord)
    }

    if (typeof document !== 'undefined') {
      this._container = typeof target === 'string' ? document.querySelector(target) : target
      this._container?.addEventListener('click', this._onClick)
      this._container?.addEventListener('keydown', this._onKeyDown)
      this._render()
    }
  }

  private _loadChord(chord: ChordDiagram): void {
    this._fingers.clear()
    this._stringStates.clear()
    this._name = chord.name
    this._barres = chord.barres?.length ? chord.barres.map((b) => ({ ...b })) : undefined
    this._position = chord.position

    for (const f of chord.fingers) {
      this._fingers.set(`${f.string}-${f.fret}`, f)
    }
    for (const s of chord.open ?? []) {
      this._stringStates.set(s, 'open')
    }
    for (const s of chord.muted ?? []) {
      this._stringStates.set(s, 'muted')
    }
  }

  private _stringsWith(state: StringState): number[] {
    return Array.from(this._stringStates.entries())
      .filter(([, s]) => s === state)
      .map(([string]) => string)
  }

  /** Get the current chord as a ChordDiagram */
  getChord(): ChordDiagram {
    const open = this._stringsWith('open')
    const muted = this._stringsWith('muted')

    return {
      ...(this._name !== undefined ? { name: this._name } : {}),
      fingers: Array.from(this._fingers.values()),
      ...(this._barres ? { barres: this._barres.map((b) => ({ ...b })) } : {}),
      ...(open.length > 0 ? { open } : {}),
      ...(muted.length > 0 ? { muted } : {}),
      ...(this._position !== undefined ? { position: this._position } : {}),
    }
  }

  /** Load a chord into the editor */
  setChord(chord: ChordDiagram): void {
    if (this._destroyed) return
    this._loadChord(chord)
    this._render()
    this._options.onChange?.(this.getChord())
  }

  /** Reset the editor to an empty, unnamed chord */
  clear(): void {
    if (this._destroyed) return
    this._fingers.clear()
    this._stringStates.clear()
    this._name = undefined
    this._barres = undefined
    this._position = undefined
    this._render()
    this._options.onChange?.(this.getChord())
  }

  /**
   * Change editor options (theme, instrument, width, …) after construction.
   * Anything that no longer fits a new instrument is dropped.
   */
  setOptions(options: Partial<ChordEditorOptions>): void {
    if (this._destroyed) return
    const { initialChord: _ignored, ...rest } = options
    this._options = { ...this._options, ...rest }
    this._prune()
    this._render()
  }

  /** Remove the editor from the page and detach its listeners */
  destroy(): void {
    if (this._destroyed) return
    this._destroyed = true
    if (this._container) {
      this._container.removeEventListener('click', this._onClick)
      this._container.removeEventListener('keydown', this._onKeyDown)
      this._container.innerHTML = ''
      this._container = null
    }
  }

  /** Drop fingers, barres and markers that fall outside the current instrument */
  private _prune(): void {
    const { strings, frets } = resolveInstrument(this._options.instrument)
    for (const [key, f] of this._fingers) {
      if (f.string > strings || f.fret > frets) this._fingers.delete(key)
    }
    for (const s of this._stringStates.keys()) {
      if (s > strings) this._stringStates.delete(s)
    }
    if (this._barres) {
      const kept = this._barres.filter(
        (b) => b.fret <= frets && b.fromString <= strings && b.toString <= strings,
      )
      this._barres = kept.length ? kept : undefined
    }
  }

  private _toggleFinger(string: number, fret: number): void {
    const key = `${string}-${fret}`
    if (this._fingers.has(key)) {
      this._fingers.delete(key)
    } else {
      this._fingers.set(key, { string, fret })
      // A fretted string is neither open nor muted.
      this._stringStates.delete(string)
    }
    this._render()
    this._options.onChange?.(this.getChord())
  }

  private _toggleStringState(string: number): void {
    const current = this._stringStates.get(string) ?? 'normal'
    const next: StringState =
      current === 'normal' ? 'open' :
      current === 'open' ? 'muted' : 'normal'

    if (next === 'normal') {
      this._stringStates.delete(string)
    } else {
      this._stringStates.set(string, next)
      // An open or muted string cannot also be fretted.
      for (const [key, f] of this._fingers) {
        if (f.string === string) this._fingers.delete(key)
      }
    }
    this._render()
    this._options.onChange?.(this.getChord())
  }

  private _activate(target: EventTarget | null): boolean {
    const el = target as Element | null
    const key = el?.getAttribute?.(HIT_ATTR)
    if (!key) return false
    const [string, fret] = key.split('-').map(Number)
    if (fret === 0) this._toggleStringState(string)
    else this._toggleFinger(string, fret)
    return true
  }

  private _onClick = (event: Event): void => {
    this._activate(event.target)
  }

  private _onKeyDown = (event: Event): void => {
    const key = (event as KeyboardEvent).key
    if (key !== 'Enter' && key !== ' ') return
    if (this._activate(event.target)) event.preventDefault()
  }

  private _render(): void {
    if (!this._container || this._destroyed) return

    const chartOpts: ChordChartOptions = {
      chord: this.getChord(),
      instrument: this._options.instrument,
      theme: this._options.theme,
      leftHanded: this._options.leftHanded,
      orientation: this._options.orientation,
      width: this._options.width,
    }
    const config = resolveConfig(chartOpts)
    const layout = computeLayout(config)

    const active = document.activeElement
    const focusedKey = active && this._container.contains(active) ? active.getAttribute(HIT_ATTR) : null

    this._container.innerHTML = render(config)

    const svg = this._container.querySelector('svg')
    if (!svg) return
    // The static chart is a single image; the editor exposes its controls instead.
    svg.setAttribute('role', 'group')

    const { strings, frets } = config.instrument
    const horizontal = layout.orientation === 'horizontal'
    const acrossSize = layout.stringSpacing / 1.5
    const ns = 'http://www.w3.org/2000/svg'

    const addHit = (
      string: number,
      fret: number,
      along: number,
      alongSize: number,
      label: string,
      pressed: boolean | null,
    ) => {
      const { x, y } = pointOnString(config, layout, string, along)
      const w = horizontal ? alongSize : acrossSize
      const h = horizontal ? acrossSize : alongSize
      const hit = document.createElementNS(ns, 'rect')
      hit.setAttribute('x', String(x - w / 2))
      hit.setAttribute('y', String(y - h / 2))
      hit.setAttribute('width', String(w))
      hit.setAttribute('height', String(h))
      hit.setAttribute('fill', 'transparent')
      hit.setAttribute('cursor', 'pointer')
      hit.setAttribute('tabindex', '0')
      hit.setAttribute('role', 'button')
      hit.setAttribute('aria-label', label)
      if (pressed !== null) hit.setAttribute('aria-pressed', String(pressed))
      hit.setAttribute(HIT_ATTR, `${string}-${fret}`)
      svg.appendChild(hit)
    }

    for (let s = 1; s <= strings; s++) {
      const state = this._stringStates.get(s) ?? 'normal'
      addHit(
        s,
        0,
        -INDICATOR_SPACE / 2,
        INDICATOR_SPACE,
        `String ${s}: ${state}. Activate to switch between open, muted and normal`,
        null,
      )

      for (let f = 1; f <= frets; f++) {
        addHit(
          s,
          f,
          fretCenter(layout, f),
          layout.fretSpacing / 1.5,
          `String ${s}, fret ${f + config.position - 1}`,
          this._fingers.has(`${s}-${f}`),
        )
      }
    }

    if (focusedKey) {
      const again = this._container.querySelector<SVGElement>(`[${HIT_ATTR}="${focusedKey}"]`)
      again?.focus?.()
    }
  }
}
