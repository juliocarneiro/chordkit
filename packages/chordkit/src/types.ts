/** Position of a single finger on the fretboard */
export interface Finger {
  /** String number (1 = highest pitch, ascending to lowest pitch) */
  string: number
  /** Fret number (1-based) */
  fret: number
  /** Optional display text inside the dot */
  text?: string
  /** Optional custom color for this finger dot */
  color?: string
  /** Optional custom text color */
  textColor?: string
  /** Dot shape: 'circle' or 'square' */
  shape?: FingerShape
}

export type FingerShape = 'circle' | 'square'

/** A barre chord spanning multiple strings on a single fret */
export interface Barre {
  /** Fret number where the barre is placed */
  fret: number
  /** Starting string (higher pitch side) */
  fromString: number
  /** Ending string (lower pitch side) */
  toString: number
  /** Optional display text */
  text?: string
  /** Optional custom color */
  color?: string
  /** Optional custom text color */
  textColor?: string
}

/** Full chord definition */
export interface ChordDiagram {
  /** Display name of the chord (e.g. "Am", "G7") */
  name?: string
  /** Finger positions on the fretboard */
  fingers: Finger[]
  /** Barre chord definitions */
  barres?: Barre[]
  /** String numbers that are muted (not played) */
  muted?: number[]
  /** String numbers that are played open */
  open?: number[]
  /** Starting fret position (default: 1) */
  position?: number
}

/** Instrument configuration */
export interface InstrumentConfig {
  /** Number of strings */
  strings: number
  /** Number of frets to display */
  frets: number
  /** Tuning labels from lowest to highest string (e.g. ['E','A','D','G','B','E']) */
  tuning?: string[]
}

/** Preset instrument name */
export type InstrumentPreset = 'guitar' | 'ukulele' | 'bass' | 'banjo' | 'cavaquinho'

/** Color theme for the chord diagram */
export interface ChordTheme {
  background: string
  fretColor: string
  stringColor: string
  dotColor: string
  dotTextColor: string
  nutColor: string
  textColor: string
  mutedColor: string
  openColor: string
  barreColor: string
  barreTextColor: string
  fontFamily: string
  /** Optional fret marker color */
  fretMarkerColor?: string
}

/** Theme identifier or custom theme object */
export type ThemeInput = 'light' | 'dark' | Partial<ChordTheme>

/** Full options for rendering a chord chart */
export interface ChordChartOptions {
  /** Instrument preset name or custom config */
  instrument?: InstrumentPreset | InstrumentConfig
  /** Chord data to render */
  chord: ChordDiagram
  /** Starting fret position — overrides chord.position */
  position?: number
  /** Theme: 'light', 'dark', or a partial custom theme object */
  theme?: ThemeInput
  /** Show tuning labels below the chart */
  showTuning?: boolean
  /** Show fret markers (dots at frets 3,5,7,9,12...) */
  showFretMarkers?: boolean
  /** Orientation of the diagram */
  orientation?: 'vertical' | 'horizontal'
  /** Fixed width in pixels (height auto-calculated). Uses viewBox for scaling. */
  width?: number
  /** Left-handed mode — mirrors the diagram horizontally */
  leftHanded?: boolean
  /** Show note names on finger dots instead of custom text. true = sharp, or 'sharp' | 'flat'. */
  noteLabels?: boolean | 'sharp' | 'flat'
  /** Automatically assign finger numbers (1-4) using ergonomic heuristics */
  autoFinger?: boolean
  /** Animate the chord with a strum effect (CSS/SVG native, zero JS runtime) */
  animate?: boolean | import('./animation').AnimationOptions
  /** Accessible title override (default: auto-generated) */
  ariaTitle?: string
  /** Accessible description override (default: auto-generated) */
  ariaDescription?: string
}

/** Internal resolved configuration (all values filled) */
export interface ResolvedConfig {
  instrument: InstrumentConfig
  chord: ChordDiagram
  position: number
  theme: ChordTheme
  showTuning: boolean
  showFretMarkers: boolean
  orientation: 'vertical' | 'horizontal'
  leftHanded: boolean
  noteLabels: false | 'sharp' | 'flat'
  autoFinger: boolean
  animate: import('./animation').AnimationOptions | null
  width: number
  ariaTitle: string
  ariaDescription: string
}

/** Layout measurements computed from resolved config */
export interface ChartLayout {
  totalWidth: number
  totalHeight: number
  gridX: number
  gridY: number
  gridWidth: number
  gridHeight: number
  stringSpacing: number
  fretSpacing: number
  nutHeight: number
  dotRadius: number
  titleHeight: number
  tuningHeight: number
  positionLabelWidth: number
}
