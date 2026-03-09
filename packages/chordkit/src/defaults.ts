import type { ChordChartOptions, ResolvedConfig } from './types'
import { resolveInstrument } from './presets'
import { resolveTheme } from './themes'
import { generateAriaTitle, generateAriaDescription } from './accessibility'
import { resolveAnimation } from './animation'
import { autoFinger } from './autofinger'

const DEFAULT_WIDTH = 260

export function resolveConfig(options: ChordChartOptions): ResolvedConfig {
  const instrument = resolveInstrument(options.instrument)
  const theme = resolveTheme(options.theme)
  const position = options.position ?? options.chord.position ?? 1
  let chord: typeof options.chord & { position: number } = { ...options.chord, position }

  const shouldAutoFinger = options.autoFinger ?? false
  if (shouldAutoFinger) {
    chord = { ...autoFinger(chord), position }
  }

  const ariaTitle = options.ariaTitle ?? generateAriaTitle(chord)
  const ariaDescription = options.ariaDescription ?? generateAriaDescription(chord, instrument)

  let noteLabels: false | 'sharp' | 'flat' = false
  if (options.noteLabels === true) noteLabels = 'sharp'
  else if (options.noteLabels === 'sharp' || options.noteLabels === 'flat') noteLabels = options.noteLabels

  return {
    instrument,
    chord,
    position,
    theme,
    showTuning: options.showTuning ?? true,
    showFretMarkers: options.showFretMarkers ?? true,
    orientation: options.orientation ?? 'vertical',
    leftHanded: options.leftHanded ?? false,
    noteLabels,
    autoFinger: shouldAutoFinger,
    animate: resolveAnimation(options.animate),
    width: options.width ?? DEFAULT_WIDTH,
    ariaTitle,
    ariaDescription,
  }
}
