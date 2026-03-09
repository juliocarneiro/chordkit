import type {
  ChordDiagram,
  ChordChartOptions,
  InstrumentPreset,
  InstrumentConfig,
  ThemeInput,
} from './types'
import { resolveConfig } from './defaults'
import { render } from './renderer'
import { resolveTheme } from './themes'
import { escapeXml, safeFontFamily } from './utils'

export interface ChordProgressionOptions {
  /** Array of chord diagrams to render in sequence */
  chords: ChordDiagram[]
  /** Instrument preset or custom config (applied to all chords) */
  instrument?: InstrumentPreset | InstrumentConfig
  /** Theme applied to all chords */
  theme?: ThemeInput
  /** Spacing in px between chord diagrams (default: 12) */
  spacing?: number
  /** Width of each individual chord chart (default: 200) */
  chordWidth?: number
  /** Optional title for the progression */
  title?: string
  /** Left-handed mode */
  leftHanded?: boolean
  /** Show tuning on first chord only (default: true) */
  showTuning?: boolean
  /** Note labels mode */
  noteLabels?: boolean | 'sharp' | 'flat'
}

/**
 * Renders multiple chord diagrams side by side in a single SVG.
 */
export class ChordProgression {
  static svg(options: ChordProgressionOptions): string {
    const {
      chords,
      instrument,
      theme,
      spacing = 12,
      chordWidth = 200,
      title,
      leftHanded,
      showTuning,
      noteLabels,
    } = options

    if (!chords.length) {
      throw new Error('ChordProgression: at least one chord is required')
    }

    const resolvedTheme = resolveTheme(theme)

    const renderedChords: { inner: string; width: number; height: number }[] = []

    for (let i = 0; i < chords.length; i++) {
      const chartOpts: ChordChartOptions = {
        chord: chords[i],
        instrument,
        theme,
        width: chordWidth,
        leftHanded,
        showTuning: showTuning ?? (i === 0),
        noteLabels,
      }
      const config = resolveConfig(chartOpts)
      const idPrefix = `ck${i}-`
      const svg = render(config, idPrefix)

      const viewBoxMatch = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/)
      const w = viewBoxMatch ? parseFloat(viewBoxMatch[1]) : chordWidth
      const h = viewBoxMatch ? parseFloat(viewBoxMatch[2]) : 300

      const inner = svg
        .replace(/<svg[^>]*>[\s]*/, '')
        .replace(/[\s]*<\/svg>/, '')

      renderedChords.push({ inner, width: w, height: h })
    }

    const maxHeight = Math.max(...renderedChords.map((c) => c.height))
    const titleHeight = title ? 36 : 0
    const totalWidth = chords.length * chordWidth + (chords.length - 1) * spacing
    const totalHeight = maxHeight + titleHeight

    const groups = renderedChords.map((chord, i) => {
      const x = i * (chordWidth + spacing)
      return `<g transform="translate(${x}, ${titleHeight})">\n${chord.inner}\n    </g>`
    })

    const titleEl = title
      ? `<text x="${totalWidth / 2}" y="26" text-anchor="middle" font-family="${safeFontFamily(resolvedTheme.fontFamily)}" font-size="20" font-weight="700" fill="${resolvedTheme.textColor}">${escapeXml(title)}</text>`
      : ''

    const ariaLabel = title
      ? `Chord progression: ${escapeXml(title)}`
      : `Chord progression: ${chords.map((c) => c.name ?? 'chord').join(' - ')}`

    return [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" role="img" aria-label="${ariaLabel}">`,
      titleEl ? `    ${titleEl}` : '',
      ...groups.map((g) => `    ${g}`),
      '</svg>',
    ].filter(Boolean).join('\n')
  }
}
