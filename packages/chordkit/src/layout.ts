import type { ResolvedConfig, ChartLayout } from './types'

export const PADDING = 20
/** Room between the nut and the edge of the grid for open/muted markers */
export const INDICATOR_SPACE = 20

const TITLE_HEIGHT = 32
const TUNING_SIZE = 22
const POSITION_LABEL_SIZE = 28
const NUT_SIZE = 6

/**
 * Compute every measurement the renderer and the interactive editor need.
 *
 * In vertical orientation strings run top to bottom and are spread along x.
 * In horizontal orientation strings run left to right (nut on the left,
 * string 1 on top) and are spread along y.
 */
export function computeLayout(config: ResolvedConfig): ChartLayout {
  const { instrument, showTuning, width, position, leftHanded } = config
  const { strings, frets } = instrument
  const horizontal = config.orientation === 'horizontal'

  const titleHeight = config.chord.name ? TITLE_HEIGHT : 0
  const hasTuning = showTuning && !!instrument.tuning
  const nutHeight = position === 1 ? NUT_SIZE : 0

  let gridX: number
  let gridY: number
  let gridWidth: number
  let gridHeight: number
  let totalHeight: number
  let tuningHeight = 0
  let positionLabelWidth = 0

  if (horizontal) {
    const side = INDICATOR_SPACE + (hasTuning ? TUNING_SIZE : 0)
    const positionLabelHeight = position > 1 ? 22 : 0
    gridWidth = width - PADDING * 2 - side
    gridHeight = gridWidth * 0.6
    gridX = leftHanded ? PADDING : PADDING + side
    gridY = PADDING + titleHeight + 10
    totalHeight = gridY + gridHeight + 10 + positionLabelHeight + PADDING
  } else {
    tuningHeight = hasTuning ? TUNING_SIZE : 0
    positionLabelWidth = position > 1 ? POSITION_LABEL_SIZE : 0
    gridWidth = width - PADDING * 2 - positionLabelWidth
    gridHeight = gridWidth * 1.1
    gridX = leftHanded ? PADDING : PADDING + positionLabelWidth
    gridY = PADDING + titleHeight + INDICATOR_SPACE
    totalHeight = gridY + gridHeight + tuningHeight + nutHeight + PADDING
  }

  const span = horizontal ? gridHeight : gridWidth
  const length = horizontal ? gridWidth : gridHeight

  // A single string has no neighbours: give it the whole span as its slot.
  const stringSpacing = strings > 1 ? span / (strings - 1) : span
  const fretSpacing = length / frets
  const dotRadius = Math.min(stringSpacing, fretSpacing) * 0.32

  return {
    orientation: horizontal ? 'horizontal' : 'vertical',
    totalWidth: width,
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

/** Size of the grid across the strings */
export function gridSpan(layout: ChartLayout): number {
  return layout.orientation === 'horizontal' ? layout.gridHeight : layout.gridWidth
}

/** Size of the grid along the strings (nut to last fret) */
export function gridLength(layout: ChartLayout): number {
  return layout.orientation === 'horizontal' ? layout.gridWidth : layout.gridHeight
}

/** Distance of a string from the grid origin, measured across the strings */
export function stringOffset(config: ResolvedConfig, layout: ChartLayout, stringNum: number): number {
  const { strings } = config.instrument
  if (strings === 1) return gridSpan(layout) / 2
  if (layout.orientation === 'horizontal') return (stringNum - 1) * layout.stringSpacing
  const slot = config.leftHanded ? stringNum - 1 : strings - stringNum
  return slot * layout.stringSpacing
}

/**
 * Convert grid coordinates to SVG coordinates.
 * @param across - px across the strings, from the grid origin
 * @param along - px along the strings, from the nut (negative = before the nut)
 */
export function place(
  config: ResolvedConfig,
  layout: ChartLayout,
  across: number,
  along: number,
): { x: number; y: number } {
  if (layout.orientation === 'horizontal') {
    const x = config.leftHanded ? layout.gridX + layout.gridWidth - along : layout.gridX + along
    return { x, y: layout.gridY + across }
  }
  return { x: layout.gridX + across, y: layout.gridY + along }
}

/** SVG coordinates of a point on a string, `along` px from the nut */
export function pointOnString(
  config: ResolvedConfig,
  layout: ChartLayout,
  stringNum: number,
  along: number,
): { x: number; y: number } {
  return place(config, layout, stringOffset(config, layout, stringNum), along)
}

/** Distance from the nut to the middle of a fret space (1-based, relative to the diagram) */
export function fretCenter(layout: ChartLayout, fret: number): number {
  return (fret - 0.5) * layout.fretSpacing
}
