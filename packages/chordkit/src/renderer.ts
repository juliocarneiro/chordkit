import type {
  ResolvedConfig,
  ChartLayout,
  ChordTheme,
  Finger,
  Barre,
} from './types'
import { escapeXml, roundedRect, barrePath, round, safeFontFamily } from './utils'
import { noteForFinger } from './music'
import { generateAnimationCSS } from './animation'

const FRET_MARKER_POSITIONS = new Set([3, 5, 7, 9, 15, 17, 19, 21])
const FRET_MARKER_DOUBLE = new Set([12, 24])

function computeLayout(config: ResolvedConfig): ChartLayout {
  const { instrument, showTuning, width } = config
  const { strings, frets } = instrument

  const titleHeight = config.chord.name ? 32 : 0
  const tuningHeight = showTuning && instrument.tuning ? 22 : 0
  const nutHeight = config.position === 1 ? 6 : 0
  const positionLabelWidth = config.position > 1 ? 28 : 0

  const padding = 20
  const topPadding = padding + titleHeight
  const indicatorSpace = 20

  const gridWidth = width - padding * 2 - positionLabelWidth
  const gridHeight = gridWidth * 1.1
  const gridX = config.leftHanded
    ? padding
    : padding + positionLabelWidth
  const gridY = topPadding + indicatorSpace

  const stringSpacing = gridWidth / (strings - 1)
  const fretSpacing = gridHeight / frets

  const dotRadius = Math.min(stringSpacing, fretSpacing) * 0.32

  const totalWidth = width
  const totalHeight = gridY + gridHeight + tuningHeight + nutHeight + padding

  return {
    totalWidth,
    totalHeight,
    gridX,
    gridY,
    gridWidth,
    gridHeight,
    stringSpacing,
    fretSpacing,
    nutHeight,
    dotRadius,
    titleHeight,
    tuningHeight,
    positionLabelWidth,
  }
}

function stringX(layout: ChartLayout, stringNum: number, totalStrings: number, leftHanded: boolean): number {
  if (leftHanded) {
    return round(layout.gridX + (stringNum - 1) * layout.stringSpacing)
  }
  return round(layout.gridX + (totalStrings - stringNum) * layout.stringSpacing)
}

function fretY(layout: ChartLayout, fretNum: number): number {
  return round(layout.gridY + fretNum * layout.fretSpacing)
}

function renderDefs(theme: ChordTheme, layout: ChartLayout, idPrefix: string): string {
  return `<defs>
    <linearGradient id="${idPrefix}dot-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${theme.dotColor}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${theme.dotColor}" stop-opacity="1"/>
    </linearGradient>
    <filter id="${idPrefix}shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-opacity="0.15"/>
    </filter>
    <linearGradient id="${idPrefix}barre-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${theme.barreColor}" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="${theme.barreColor}" stop-opacity="1"/>
    </linearGradient>
  </defs>`
}

function renderBackground(theme: ChordTheme, layout: ChartLayout): string {
  return `<rect width="${layout.totalWidth}" height="${layout.totalHeight}" fill="${theme.background}" rx="8" ry="8"/>`
}

function renderTitle(config: ResolvedConfig, layout: ChartLayout): string {
  if (!config.chord.name) return ''
  const x = round(layout.totalWidth / 2)
  const y = round(layout.gridY - 26)
  const fontSize = 18
  return `<text x="${x}" y="${y}" text-anchor="middle" font-family="${safeFontFamily(config.theme.fontFamily)}" font-size="${fontSize}" font-weight="600" fill="${config.theme.textColor}">${escapeXml(config.chord.name)}</text>`
}

function renderNut(config: ResolvedConfig, layout: ChartLayout): string {
  if (config.position !== 1) return ''
  const x = layout.gridX
  const y = round(layout.gridY - 3)
  const w = layout.gridWidth
  return `<rect x="${x}" y="${y}" width="${w}" height="6" fill="${config.theme.nutColor}" rx="2" ry="2"/>`
}

function renderPositionLabel(config: ResolvedConfig, layout: ChartLayout): string {
  if (config.position <= 1) return ''
  const y = round(fretY(layout, 0) + layout.fretSpacing / 2 + 5)

  if (config.leftHanded) {
    const x = round(layout.gridX + layout.gridWidth + 10)
    return `<text x="${x}" y="${y}" text-anchor="start" font-family="${safeFontFamily(config.theme.fontFamily)}" font-size="12" font-weight="500" fill="${config.theme.textColor}">${config.position}fr</text>`
  }

  const x = round(layout.gridX - 10)
  return `<text x="${x}" y="${y}" text-anchor="end" font-family="${safeFontFamily(config.theme.fontFamily)}" font-size="12" font-weight="500" fill="${config.theme.textColor}">${config.position}fr</text>`
}

function renderGrid(config: ResolvedConfig, layout: ChartLayout): string {
  const { instrument, theme } = config
  const parts: string[] = []

  for (let i = 0; i <= instrument.frets; i++) {
    const y = fretY(layout, i)
    const lineWidth = i === 0 ? 2 : 1.2
    parts.push(
      `<line x1="${layout.gridX}" y1="${y}" x2="${round(layout.gridX + layout.gridWidth)}" y2="${y}" stroke="${theme.fretColor}" stroke-width="${lineWidth}" stroke-linecap="round"/>`,
    )
  }

  for (let i = 0; i < instrument.strings; i++) {
    const x = round(layout.gridX + i * layout.stringSpacing)
    const y1 = fretY(layout, 0)
    const y2 = fretY(layout, instrument.frets)
    const thicknessIndex = config.leftHanded ? (instrument.strings - 1 - i) : i
    const thickness = round(1 + (thicknessIndex / (instrument.strings - 1)) * 1.2)
    parts.push(
      `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="${theme.stringColor}" stroke-width="${thickness}" stroke-linecap="round"/>`,
    )
  }

  return parts.join('\n    ')
}

function renderFretMarkers(config: ResolvedConfig, layout: ChartLayout): string {
  if (!config.showFretMarkers) return ''
  const { instrument, theme, position } = config
  const parts: string[] = []
  const r = 3.5
  const centerX = round(layout.gridX + layout.gridWidth / 2)
  const markerColor = theme.fretMarkerColor ?? theme.fretColor

  for (let fret = 1; fret <= instrument.frets; fret++) {
    const absoluteFret = position + fret - 1
    const y = round(fretY(layout, fret) - layout.fretSpacing / 2)

    if (FRET_MARKER_DOUBLE.has(absoluteFret)) {
      const offset = layout.gridWidth * 0.25
      parts.push(
        `<circle cx="${round(centerX - offset)}" cy="${y}" r="${r}" fill="${markerColor}" opacity="0.5"/>`,
        `<circle cx="${round(centerX + offset)}" cy="${y}" r="${r}" fill="${markerColor}" opacity="0.5"/>`,
      )
    } else if (FRET_MARKER_POSITIONS.has(absoluteFret)) {
      parts.push(
        `<circle cx="${centerX}" cy="${y}" r="${r}" fill="${markerColor}" opacity="0.5"/>`,
      )
    }
  }

  return parts.join('\n    ')
}

function renderOpenMuted(config: ResolvedConfig, layout: ChartLayout): string {
  const { chord, instrument, theme, leftHanded } = config
  const parts: string[] = []
  const y = round(layout.gridY - 12)
  const size = 5

  if (chord.open) {
    for (const s of chord.open) {
      const x = stringX(layout, s, instrument.strings, leftHanded)
      parts.push(
        `<circle cx="${x}" cy="${y}" r="${size}" fill="none" stroke="${theme.openColor}" stroke-width="1.8" aria-label="String ${s} open"/>`,
      )
    }
  }

  if (chord.muted) {
    for (const s of chord.muted) {
      const x = stringX(layout, s, instrument.strings, leftHanded)
      const half = size * 0.8
      parts.push(
        `<g aria-label="String ${s} muted">`,
        `  <line x1="${round(x - half)}" y1="${round(y - half)}" x2="${round(x + half)}" y2="${round(y + half)}" stroke="${theme.mutedColor}" stroke-width="2" stroke-linecap="round"/>`,
        `  <line x1="${round(x + half)}" y1="${round(y - half)}" x2="${round(x - half)}" y2="${round(y + half)}" stroke="${theme.mutedColor}" stroke-width="2" stroke-linecap="round"/>`,
        `</g>`,
      )
    }
  }

  return parts.join('\n    ')
}

function renderFingers(config: ResolvedConfig, layout: ChartLayout, idPrefix: string): string {
  const { chord, instrument, theme, leftHanded, noteLabels, animate } = config
  const parts: string[] = []

  for (let i = 0; i < chord.fingers.length; i++) {
    const finger = chord.fingers[i]
    const x = stringX(layout, finger.string, instrument.strings, leftHanded)
    const y = round(fretY(layout, finger.fret) - layout.fretSpacing / 2)
    const r = layout.dotRadius
    const color = finger.color ?? `url(#${idPrefix}dot-grad)`
    const textColor = finger.textColor ?? theme.dotTextColor
    const animClass = animate ? ` class="ck-dot-${i}"` : ''

    if (finger.shape === 'square') {
      const side = r * 1.7
      parts.push(
        `<rect x="${round(x - side / 2)}" y="${round(y - side / 2)}" width="${round(side)}" height="${round(side)}" rx="3" ry="3" fill="${color}" filter="url(#${idPrefix}shadow)"${animClass}/>`,
      )
    } else {
      parts.push(
        `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" filter="url(#${idPrefix}shadow)"${animClass}/>`,
      )
    }

    let label = finger.text ?? ''
    if (noteLabels && instrument.tuning) {
      label = noteForFinger(
        instrument.tuning,
        instrument.strings,
        finger.string,
        finger.fret,
        config.position,
        noteLabels,
      )
    }

    if (label) {
      const fontSize = round(r * (label.length > 1 ? 0.95 : 1.2))
      parts.push(
        `<text x="${x}" y="${round(y + fontSize * 0.36)}" text-anchor="middle" font-family="${safeFontFamily(theme.fontFamily)}" font-size="${fontSize}" font-weight="600" fill="${textColor}"${animClass}>${escapeXml(label)}</text>`,
      )
    }
  }

  return parts.join('\n    ')
}

function renderBarres(config: ResolvedConfig, layout: ChartLayout, idPrefix: string): string {
  const { chord, instrument, theme, leftHanded, animate } = config
  if (!chord.barres?.length) return ''

  const parts: string[] = []

  for (let i = 0; i < chord.barres.length; i++) {
    const barre = chord.barres[i]
    const x1 = stringX(layout, barre.fromString, instrument.strings, leftHanded)
    const x2 = stringX(layout, barre.toString, instrument.strings, leftHanded)
    const y = round(fretY(layout, barre.fret) - layout.fretSpacing / 2)
    const color = barre.color ?? `url(#${idPrefix}barre-grad)`
    const textColor = barre.textColor ?? theme.barreTextColor
    const height = layout.dotRadius * 2
    const animClass = animate ? ` class="ck-barre-${i}"` : ''

    const leftX = Math.min(x1, x2)
    const rightX = Math.max(x1, x2)
    const barreWidth = rightX - leftX

    parts.push(
      `<rect x="${leftX}" y="${round(y - height / 2)}" width="${barreWidth}" height="${height}" rx="${round(height / 2)}" ry="${round(height / 2)}" fill="${color}" filter="url(#${idPrefix}shadow)"${animClass}/>`,
    )

    if (barre.text) {
      const fontSize = round(layout.dotRadius * 1.1)
      const cx = round(leftX + barreWidth / 2)
      parts.push(
        `<text x="${cx}" y="${round(y + fontSize * 0.36)}" text-anchor="middle" font-family="${safeFontFamily(theme.fontFamily)}" font-size="${fontSize}" font-weight="600" fill="${textColor}"${animClass}>${escapeXml(barre.text)}</text>`,
      )
    }
  }

  return parts.join('\n    ')
}

function renderTuning(config: ResolvedConfig, layout: ChartLayout): string {
  if (!config.showTuning || !config.instrument.tuning) return ''

  const { instrument, theme, leftHanded } = config
  const parts: string[] = []
  const y = round(fretY(layout, instrument.frets) + 18)

  for (let i = 0; i < instrument.strings; i++) {
    const label = instrument?.tuning?.[i] ?? ''
    if (!label) continue
    const x = stringX(layout, instrument.strings - i, instrument.strings, leftHanded)
    parts.push(
      `<text x="${x}" y="${y}" text-anchor="middle" font-family="${safeFontFamily(theme.fontFamily)}" font-size="11" fill="${theme.textColor}" opacity="0.65">${escapeXml(label)}</text>`,
    )
  }

  return parts.join('\n    ')
}

function renderAccessibility(config: ResolvedConfig): string {
  return [
    `<title>${escapeXml(config.ariaTitle)}</title>`,
    `<desc>${escapeXml(config.ariaDescription)}</desc>`,
  ].join('\n    ')
}

export function render(config: ResolvedConfig, idPrefix = 'ck-'): string {
  const layout = computeLayout(config)

  const widthAttr = config.width ? ` width="${config.width}"` : ''

  let animStyle = ''
  if (config.animate) {
    const fingerCount = config.chord.fingers.length
    const barreCount = config.chord.barres?.length ?? 0
    animStyle = generateAnimationCSS(fingerCount, barreCount, config.animate)
  }

  const parts = [
    renderDefs(config.theme, layout, idPrefix),
    animStyle,
    renderBackground(config.theme, layout),
    renderTitle(config, layout),
    renderNut(config, layout),
    renderGrid(config, layout),
    renderFretMarkers(config, layout),
    renderOpenMuted(config, layout),
    renderBarres(config, layout, idPrefix),
    renderFingers(config, layout, idPrefix),
    renderTuning(config, layout),
    renderPositionLabel(config, layout),
  ].filter(Boolean)

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${layout.totalWidth} ${round(layout.totalHeight)}"${widthAttr} role="img" aria-labelledby="ck-title ck-desc">`,
    `    ${renderAccessibility(config)}`,
    ...parts.map((p) => `    ${p}`),
    `</svg>`,
  ].join('\n')
}
