import type {
  ChordChartOptions,
  ChordDiagram,
  InstrumentPreset,
  InstrumentConfig,
  ThemeInput,
} from './types'
import type { AnimationInput } from './animation'
import { resolveConfig } from './defaults'
import { render } from './renderer'
import { toSVGDataURL, toPNG, download } from './export'
import type { PNGOptions, DownloadOptions } from './export'

/**
 * Main entry point for generating chord diagrams.
 *
 * Can be used as a static helper for pure SVG string output,
 * or instantiated with a DOM selector/element for browser rendering.
 */
export class ChordChart {
  private _target: string | null = null
  private _options: Partial<ChordChartOptions> = {}

  /**
   * Create a ChordChart instance attached to a DOM element.
   * Pass a CSS selector string or omit for string-only rendering.
   */
  constructor(target?: string) {
    this._target = target ?? null
  }

  /** Set the instrument preset or custom config */
  instrument(value: InstrumentPreset | InstrumentConfig): this {
    this._options.instrument = value
    return this
  }

  /** Set the chord data */
  chord(value: ChordDiagram): this {
    this._options.chord = value
    return this
  }

  /** Set the starting fret position */
  position(value: number): this {
    this._options.position = value
    return this
  }

  /** Set the color theme */
  theme(value: ThemeInput): this {
    this._options.theme = value
    return this
  }

  /** Show or hide tuning labels */
  showTuning(value: boolean): this {
    this._options.showTuning = value
    return this
  }

  /** Show or hide fret markers */
  showFretMarkers(value: boolean): this {
    this._options.showFretMarkers = value
    return this
  }

  /** Set the diagram orientation */
  orientation(value: 'vertical' | 'horizontal'): this {
    this._options.orientation = value
    return this
  }

  /** Enable or disable left-handed mode (mirrors the diagram) */
  leftHanded(value: boolean = true): this {
    this._options.leftHanded = value
    return this
  }

  /** Show note names on finger dots. true = sharp notation. */
  noteLabels(value: boolean | 'sharp' | 'flat' = true): this {
    this._options.noteLabels = value
    return this
  }

  /** Automatically assign finger numbers (1-4) */
  autoFinger(value: boolean = true): this {
    this._options.autoFinger = value
    return this
  }

  /** Enable strum animation (CSS/SVG native, zero JS runtime) */
  animate(value: AnimationInput = true): this {
    this._options.animate = value
    return this
  }

  /** Set the width in pixels */
  width(value: number): this {
    this._options.width = value
    return this
  }

  /** Set a custom ARIA title */
  ariaTitle(value: string): this {
    this._options.ariaTitle = value
    return this
  }

  /** Set a custom ARIA description */
  ariaDescription(value: string): this {
    this._options.ariaDescription = value
    return this
  }

  private _ensureChord(): void {
    if (!this._options.chord) {
      throw new Error('ChordChart: chord data is required. Call .chord() before .draw()')
    }
  }

  /**
   * Render the chord diagram.
   * In a browser with a target element, injects the SVG into the DOM.
   * Always returns the SVG string.
   */
  draw(): string {
    this._ensureChord()
    const svgString = render(resolveConfig(this._options as ChordChartOptions))

    if (this._target && typeof document !== 'undefined') {
      const el = document.querySelector(this._target)
      if (el) {
        el.innerHTML = svgString
      }
    }

    return svgString
  }

  /**
   * Generate SVG string from a full options object (no DOM needed).
   * Ideal for SSR, Node.js, or any non-browser context.
   */
  static svg(options: ChordChartOptions): string {
    const config = resolveConfig(options)
    return render(config)
  }

  /** Convert options to a base64 SVG data URL (works in Node and browser) */
  static toSVGDataURL(options: ChordChartOptions): string {
    return toSVGDataURL(ChordChart.svg(options))
  }

  /** Convert options to PNG Blob (browser-only, async) */
  static async toPNG(options: ChordChartOptions, pngOpts?: PNGOptions): Promise<Blob> {
    return toPNG(ChordChart.svg(options), pngOpts)
  }

  /** Download the chord as a file (browser-only, async) */
  static async download(options: ChordChartOptions, dlOpts?: DownloadOptions): Promise<void> {
    return download(ChordChart.svg(options), dlOpts)
  }

  /** Remove the rendered SVG from the target element */
  clear(): this {
    if (this._target && typeof document !== 'undefined') {
      const el = document.querySelector(this._target)
      if (el) {
        el.innerHTML = ''
      }
    }
    return this
  }
}
