import type { ResolvedConfig, ChartLayout, ChordTheme } from './types'
import { escapeXml, round, safeFontFamily, hashString } from './utils'
import { noteForFinger } from './music'
import { generateAnimationCSS } from './animation'
import {
  computeLayout,
  gridSpan,
  gridLength,
  place,
  pointOnString,
  fretCenter,
  INDICATOR_SPACE,
  PADDING,
} from './layout'

const FRET_MARKER_POSITIONS = new Set([3, 5, 7, 9, 15, 17, 19, 21])
const FRET_MARKER_DOUBLE = new Set([12, 24])

/** Escape a user-supplied value for use inside a double-quoted attribute */
const attr = escapeXml

function renderDefs(theme: ChordTheme, idPrefix: string): string {
  const dot = attr(theme.dotColor)
  const barre = attr(theme.barreColor)
  return `<defs>
    <linearGradient id="${idPrefix}dot-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${dot}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${dot}" stop-opacity="1"/>
    </linearGradient>
    <filter id="${idPrefix}shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-opacity="0.15"/>
    </filter>
    <linearGradient id="${idPrefix}barre-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${barre}" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="${barre}" stop-opacity="1"/>
    </linearGradient>
  </defs>`
}

function renderBackground(theme: ChordTheme, layout: ChartLayout): string {
  return `<rect width="${layout.totalWidth}" height="${round(layout.totalHeight)}" fill="${attr(theme.background)}" rx="8" ry="8"/>`
}

function renderTitle(config: ResolvedConfig, layout: ChartLayout): string {
  if (!config.chord.name) return ''
  const x = round(layout.totalWidth / 2)
  const y = PADDING + 26
  return `<text x="${x}" y="${y}" text-anchor="middle" font-family="${safeFontFamily(config.theme.fontFamily)}" font-size="18" font-weight="600" fill="${attr(config.theme.textColor)}">${escapeXml(config.chord.name)}</text>`
}

function renderNut(config: ResolvedConfig, layout: ChartLayout): string {
  if (config.position !== 1) return ''
  const start = place(config, layout, 0, 0)
  const fill = attr(config.theme.nutColor)
  if (layout.orientation === 'horizontal') {
    return `<rect x="${round(start.x - 3)}" y="${round(start.y)}" width="6" height="${round(layout.gridHeight)}" fill="${fill}" rx="2" ry="2"/>`
  }
  return `<rect x="${round(start.x)}" y="${round(start.y - 3)}" width="${round(layout.gridWidth)}" height="6" fill="${fill}" rx="2" ry="2"/>`
}

function renderPositionLabel(config: ResolvedConfig, layout: ChartLayout): string {
  if (config.position <= 1) return ''
  const font = `font-family="${safeFontFamily(config.theme.fontFamily)}" font-size="12" font-weight="500" fill="${attr(config.theme.textColor)}"`
  const label = `${config.position}fr`

  if (layout.orientation === 'horizontal') {
    const x = round(place(config, layout, 0, layout.fretSpacing / 2).x)
    const y = round(layout.gridY + layout.gridHeight + 22)
    return `<text x="${x}" y="${y}" text-anchor="middle" ${font}>${label}</text>`
  }

  const y = round(layout.gridY + layout.fretSpacing / 2 + 5)
  if (config.leftHanded) {
    const x = round(layout.gridX + layout.gridWidth + 10)
    return `<text x="${x}" y="${y}" text-anchor="start" ${font}>${label}</text>`
  }
  const x = round(layout.gridX - 10)
  return `<text x="${x}" y="${y}" text-anchor="end" ${font}>${label}</text>`
}

function renderGrid(config: ResolvedConfig, layout: ChartLayout): string {
  const { instrument, theme } = config
  const parts: string[] = []
  const span = gridSpan(layout)
  const length = gridLength(layout)
  const fretColor = attr(theme.fretColor)
  const stringColor = attr(theme.stringColor)

  for (let i = 0; i <= instrument.frets; i++) {
    const a = place(config, layout, 0, i * layout.fretSpacing)
    const b = place(config, layout, span, i * layout.fretSpacing)
    const lineWidth = i === 0 ? 2 : 1.2
    parts.push(
      `<line x1="${round(a.x)}" y1="${round(a.y)}" x2="${round(b.x)}" y2="${round(b.y)}" stroke="${fretColor}" stroke-width="${lineWidth}" stroke-linecap="round"/>`,
    )
  }

  // String 1 is the highest pitch (thinnest); the last string is the lowest (thickest).
  const steps = Math.max(1, instrument.strings - 1)
  for (let s = 1; s <= instrument.strings; s++) {
    const a = pointOnString(config, layout, s, 0)
    const b = pointOnString(config, layout, s, length)
    const thickness = round(1 + ((s - 1) / steps) * 1.2)
    parts.push(
      `<line x1="${round(a.x)}" y1="${round(a.y)}" x2="${round(b.x)}" y2="${round(b.y)}" stroke="${stringColor}" stroke-width="${thickness}" stroke-linecap="round"/>`,
    )
  }

  return parts.join('\n    ')
}

function renderFretMarkers(config: ResolvedConfig, layout: ChartLayout): string {
  if (!config.showFretMarkers) return ''
  const { instrument, theme, position } = config
  const parts: string[] = []
  const r = 3.5
  const span = gridSpan(layout)
  const markerColor = attr(theme.fretMarkerColor ?? theme.fretColor)

  const marker = (across: number, along: number) => {
    const p = place(config, layout, across, along)
    return `<circle cx="${round(p.x)}" cy="${round(p.y)}" r="${r}" fill="${markerColor}" opacity="0.5"/>`
  }

  for (let fret = 1; fret <= instrument.frets; fret++) {
    const absoluteFret = position + fret - 1
    const along = fretCenter(layout, fret)

    if (FRET_MARKER_DOUBLE.has(absoluteFret)) {
      parts.push(marker(span * 0.25, along), marker(span * 0.75, along))
    } else if (FRET_MARKER_POSITIONS.has(absoluteFret)) {
      parts.push(marker(span / 2, along))
    }
  }

  return parts.join('\n    ')
}

function renderOpenMuted(config: ResolvedConfig, layout: ChartLayout): string {
  const { chord, theme } = config
  const parts: string[] = []
  const size = 5
  const along = -12

  for (const s of chord.open ?? []) {
    const p = pointOnString(config, layout, s, along)
    parts.push(
      `<circle cx="${round(p.x)}" cy="${round(p.y)}" r="${size}" fill="none" stroke="${attr(theme.openColor)}" stroke-width="1.8" aria-label="String ${s} open"/>`,
    )
  }

  for (const s of chord.muted ?? []) {
    const { x, y } = pointOnString(config, layout, s, along)
    const half = size * 0.8
    const stroke = attr(theme.mutedColor)
    parts.push(
      `<g aria-label="String ${s} muted">`,
      `  <line x1="${round(x - half)}" y1="${round(y - half)}" x2="${round(x + half)}" y2="${round(y + half)}" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>`,
      `  <line x1="${round(x + half)}" y1="${round(y - half)}" x2="${round(x - half)}" y2="${round(y + half)}" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>`,
      `</g>`,
    )
  }

  return parts.join('\n    ')
}

function renderFingers(config: ResolvedConfig, layout: ChartLayout, idPrefix: string): string {
  const { chord, instrument, theme, noteLabels, animate } = config
  const parts: string[] = []
  const font = safeFontFamily(theme.fontFamily)

  for (let i = 0; i < chord.fingers.length; i++) {
    const finger = chord.fingers[i]
    const p = pointOnString(config, layout, finger.string, fretCenter(layout, finger.fret))
    const x = round(p.x)
    const y = round(p.y)
    const r = round(layout.dotRadius)
    const color = finger.color !== undefined ? attr(finger.color) : `url(#${idPrefix}dot-grad)`
    const textColor = attr(finger.textColor ?? theme.dotTextColor)
    const animClass = animate ? ` class="${idPrefix}dot-${i}"` : ''

    if (finger.shape === 'square') {
      const side = layout.dotRadius * 1.7
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
      const note = noteForFinger(
        instrument.tuning,
        instrument.strings,
        finger.string,
        finger.fret,
        config.position,
        noteLabels,
      )
      if (note) label = note
    }

    if (label) {
      const fontSize = round(layout.dotRadius * (label.length > 1 ? 0.95 : 1.2))
      parts.push(
        `<text x="${x}" y="${round(y + fontSize * 0.36)}" text-anchor="middle" font-family="${font}" font-size="${fontSize}" font-weight="600" fill="${textColor}"${animClass}>${escapeXml(label)}</text>`,
      )
    }
  }

  return parts.join('\n    ')
}

function renderBarres(config: ResolvedConfig, layout: ChartLayout, idPrefix: string): string {
  const { chord, theme, animate } = config
  if (!chord.barres?.length) return ''

  const parts: string[] = []
  const font = safeFontFamily(theme.fontFamily)
  const thickness = layout.dotRadius * 2
  const radius = round(thickness / 2)

  for (let i = 0; i < chord.barres.length; i++) {
    const barre = chord.barres[i]
    const along = fretCenter(layout, barre.fret)
    const a = pointOnString(config, layout, barre.fromString, along)
    const b = pointOnString(config, layout, barre.toString, along)
    const color = barre.color !== undefined ? attr(barre.color) : `url(#${idPrefix}barre-grad)`
    const textColor = attr(barre.textColor ?? theme.barreTextColor)
    const animClass = animate ? ` class="${idPrefix}barre-${i}"` : ''

    const left = Math.min(a.x, b.x)
    const top = Math.min(a.y, b.y)
    const rect =
      layout.orientation === 'horizontal'
        ? { x: left - thickness / 2, y: top, width: thickness, height: Math.abs(b.y - a.y) }
        : { x: left, y: top - thickness / 2, width: Math.abs(b.x - a.x), height: thickness }

    parts.push(
      `<rect x="${round(rect.x)}" y="${round(rect.y)}" width="${round(rect.width)}" height="${round(rect.height)}" rx="${radius}" ry="${radius}" fill="${color}" filter="url(#${idPrefix}shadow)"${animClass}/>`,
    )

    if (barre.text) {
      const fontSize = round(layout.dotRadius * 1.1)
      const cx = round(rect.x + rect.width / 2)
      const cy = rect.y + rect.height / 2
      parts.push(
        `<text x="${cx}" y="${round(cy + fontSize * 0.36)}" text-anchor="middle" font-family="${font}" font-size="${fontSize}" font-weight="600" fill="${textColor}"${animClass}>${escapeXml(barre.text)}</text>`,
      )
    }
  }

  return parts.join('\n    ')
}

function renderTuning(config: ResolvedConfig, layout: ChartLayout): string {
  const { instrument, theme } = config
  if (!config.showTuning || !instrument.tuning) return ''

  const parts: string[] = []
  const horizontal = layout.orientation === 'horizontal'
  const along = horizontal ? -(INDICATOR_SPACE + 11) : gridLength(layout) + 18
  const font = safeFontFamily(theme.fontFamily)

  for (let i = 0; i < instrument.strings; i++) {
    const label = instrument.tuning[i] ?? ''
    if (!label) continue
    const p = pointOnString(config, layout, instrument.strings - i, along)
    const y = horizontal ? p.y + 4 : p.y
    parts.push(
      `<text x="${round(p.x)}" y="${round(y)}" text-anchor="middle" font-family="${font}" font-size="11" fill="${attr(theme.textColor)}" opacity="0.65">${escapeXml(label)}</text>`,
    )
  }

  return parts.join('\n    ')
}

function renderAccessibility(config: ResolvedConfig, idPrefix: string): string {
  return [
    `<title id="${idPrefix}title">${escapeXml(config.ariaTitle)}</title>`,
    `<desc id="${idPrefix}desc">${escapeXml(config.ariaDescription)}</desc>`,
  ].join('\n    ')
}

/**
 * Ids inside an inline SVG are global to the page, so two charts must not share them
 * unless their content is identical. Deriving the prefix from the config keeps it
 * deterministic (safe for SSR hydration) while separating charts that differ.
 */
export function idPrefixFor(config: ResolvedConfig): string {
  return `ck-${hashString(JSON.stringify(config))}-`
}

export function render(config: ResolvedConfig, idPrefix: string = idPrefixFor(config)): string {
  const layout = computeLayout(config)

  let animStyle = ''
  if (config.animate) {
    const fingerCount = config.chord.fingers.length
    const barreCount = config.chord.barres?.length ?? 0
    animStyle = generateAnimationCSS(fingerCount, barreCount, config.animate, idPrefix)
  }

  const parts = [
    renderDefs(config.theme, idPrefix),
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
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${layout.totalWidth} ${round(layout.totalHeight)}" width="${layout.totalWidth}" role="img" aria-labelledby="${idPrefix}title ${idPrefix}desc">`,
    `    ${renderAccessibility(config, idPrefix)}`,
    ...parts.map((p) => `    ${p}`),
    `</svg>`,
  ].join('\n')
}
