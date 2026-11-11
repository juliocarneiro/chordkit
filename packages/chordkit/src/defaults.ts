import type { ChordChartOptions, ChordDiagram, InstrumentConfig, ResolvedConfig } from './types'
import { resolveInstrument } from './presets'
import { resolveTheme } from './themes'
import { generateAriaTitle, generateAriaDescription } from './accessibility'
import { resolveAnimation } from './animation'
import { autoFinger } from './autofinger'

const DEFAULT_WIDTH = 260

const isPositiveInt = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n) && n >= 1

/**
 * Fail early with a readable message instead of emitting an SVG full of NaN
 * or drawing dots outside the fretboard.
 */
function validate(chord: ChordDiagram, instrument: InstrumentConfig, position: number, width: number): void {
  const { strings, frets } = instrument

  if (!isPositiveInt(strings)) {
    throw new RangeError(`chordkit: instrument.strings must be a positive integer (got ${strings})`)
  }
  if (!isPositiveInt(frets)) {
    throw new RangeError(`chordkit: instrument.frets must be a positive integer (got ${frets})`)
  }
  if (typeof width !== 'number' || !Number.isFinite(width) || width <= 0) {
    throw new RangeError(`chordkit: width must be a positive number (got ${width})`)
  }
  if (!isPositiveInt(position)) {
    throw new RangeError(`chordkit: position must be a positive integer (got ${position})`)
  }

  const checkString = (what: string, s: number) => {
    if (!isPositiveInt(s) || s > strings) {
      throw new RangeError(`chordkit: ${what} is on string ${s}, but the instrument has strings 1–${strings}`)
    }
  }
  const checkFret = (what: string, f: number) => {
    if (!isPositiveInt(f) || f > frets) {
      throw new RangeError(
        `chordkit: ${what} is at fret ${f}, but the diagram shows frets 1–${frets} (frets are relative to "position")`,
      )
    }
  }

  for (const finger of chord.fingers) {
    checkString('finger', finger.string)
    checkFret('finger', finger.fret)
  }
  for (const barre of chord.barres ?? []) {
    checkString('barre', barre.fromString)
    checkString('barre', barre.toString)
    checkFret('barre', barre.fret)
  }
  for (const s of chord.open ?? []) checkString('open marker', s)
  for (const s of chord.muted ?? []) checkString('muted marker', s)
}

export function resolveConfig(options: ChordChartOptions): ResolvedConfig {
  const instrument = resolveInstrument(options.instrument)
  const theme = resolveTheme(options.theme)
  const position = options.position ?? options.chord.position ?? 1
  const width = options.width ?? DEFAULT_WIDTH
  let chord: typeof options.chord & { position: number } = { ...options.chord, position }

  validate(chord, instrument, position, width)

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
    orientation: options.orientation === 'horizontal' ? 'horizontal' : 'vertical',
    leftHanded: options.leftHanded ?? false,
    noteLabels,
    autoFinger: shouldAutoFinger,
    animate: resolveAnimation(options.animate),
    width,
    ariaTitle,
    ariaDescription,
  }
}
