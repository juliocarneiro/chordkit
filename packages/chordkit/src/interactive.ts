import type {
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

type StringState = 'normal' | 'open' | 'muted'

export interface ChordEditorOptions {
  /** Instrument preset or custom config */
  instrument?: InstrumentPreset | InstrumentConfig
  /** Theme */
  theme?: ThemeInput
  /** Left-handed mode */
  leftHanded?: boolean
  /** Callback fired whenever the chord changes */
  onChange?: (chord: ChordDiagram) => void
  /** Initial chord to load */
  initialChord?: ChordDiagram
  /** Width of the editor */
  width?: number
}

/**
 * Interactive chord editor that renders into a DOM element.
 * Click on fret intersections to place/remove fingers.
 * Click above strings to toggle open/muted state.
 * Browser-only.
 */
export class ChordEditor {
  private _container: HTMLElement | null = null
  private _selector: string
  private _options: ChordEditorOptions
  private _fingers: Map<string, Finger> = new Map()
  private _stringStates: Map<number, StringState> = new Map()
  private _instrument: { strings: number; frets: number; tuning?: string[] }

  constructor(selector: string, options: ChordEditorOptions = {}) {
    this._selector = selector
    this._options = options
    this._instrument = resolveInstrument(options.instrument)

    if (options.initialChord) {
      this._loadChord(options.initialChord)
    }

    if (typeof document !== 'undefined') {
      this._container = document.querySelector(selector)
      this._render()
    }
  }

  private _loadChord(chord: ChordDiagram): void {
    this._fingers.clear()
    this._stringStates.clear()

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

  /** Get the current chord as a ChordDiagram */
  getChord(): ChordDiagram {
    const fingers = Array.from(this._fingers.values())
    const open = Array.from(this._stringStates.entries())
      .filter(([, state]) => state === 'open')
      .map(([s]) => s)
    const muted = Array.from(this._stringStates.entries())
      .filter(([, state]) => state === 'muted')
      .map(([s]) => s)

    return {
      fingers,
      ...(open.length > 0 ? { open } : {}),
      ...(muted.length > 0 ? { muted } : {}),
    }
  }

  /** Load a chord into the editor */
  setChord(chord: ChordDiagram): void {
    this._loadChord(chord)
    this._render()
    this._options.onChange?.(this.getChord())
  }

  /** Clear all fingers and string states */
  clear(): void {
    this._fingers.clear()
    this._stringStates.clear()
    this._render()
    this._options.onChange?.(this.getChord())
  }

  private _toggleFinger(string: number, fret: number): void {
    const key = `${string}-${fret}`
    if (this._fingers.has(key)) {
      this._fingers.delete(key)
    } else {
      this._fingers.set(key, { string, fret })
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
    }
    this._render()
    this._options.onChange?.(this.getChord())
  }

  private _render(): void {
    if (!this._container) return

    const chord = this.getChord()
    const chartOpts: ChordChartOptions = {
      chord,
      instrument: this._options.instrument,
      theme: this._options.theme,
      leftHanded: this._options.leftHanded,
      width: this._options.width,
    }
    const config = resolveConfig(chartOpts)
    const svgString = render(config)

    this._container.innerHTML = svgString

    const svg = this._container.querySelector('svg')
    if (!svg) return

    const viewBoxMatch = svgString.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/)
    if (!viewBoxMatch) return

    const { strings, frets } = this._instrument
    const leftHanded = this._options.leftHanded ?? false

    const width = config.width
    const positionLabelWidth = config.position > 1 ? 28 : 0
    const padding = 20
    const titleHeight = chord.name ? 32 : 0
    const topPadding = padding + titleHeight
    const indicatorSpace = 20
    const gridWidth = width - padding * 2 - positionLabelWidth
    const gridHeight = gridWidth * 1.1
    const gridX = leftHanded ? padding : padding + positionLabelWidth
    const gridY = topPadding + indicatorSpace
    const stringSpacing = gridWidth / (strings - 1)
    const fretSpacing = gridHeight / frets

    const ns = 'http://www.w3.org/2000/svg'

    for (let s = 1; s <= strings; s++) {
      const sx = leftHanded
        ? gridX + (s - 1) * stringSpacing
        : gridX + (strings - s) * stringSpacing

      const hitArea = document.createElementNS(ns, 'rect')
      hitArea.setAttribute('x', String(sx - stringSpacing / 3))
      hitArea.setAttribute('y', String(gridY - indicatorSpace))
      hitArea.setAttribute('width', String(stringSpacing / 1.5))
      hitArea.setAttribute('height', String(indicatorSpace))
      hitArea.setAttribute('fill', 'transparent')
      hitArea.setAttribute('cursor', 'pointer')
      hitArea.addEventListener('click', () => this._toggleStringState(s))
      svg.appendChild(hitArea)

      for (let f = 1; f <= frets; f++) {
        const fy = gridY + f * fretSpacing - fretSpacing / 2
        const hit = document.createElementNS(ns, 'rect')
        hit.setAttribute('x', String(sx - stringSpacing / 3))
        hit.setAttribute('y', String(fy - fretSpacing / 3))
        hit.setAttribute('width', String(stringSpacing / 1.5))
        hit.setAttribute('height', String(fretSpacing / 1.5))
        hit.setAttribute('fill', 'transparent')
        hit.setAttribute('cursor', 'pointer')
        hit.addEventListener('click', () => this._toggleFinger(s, f))
        svg.appendChild(hit)
      }
    }
  }
}
