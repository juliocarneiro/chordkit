export { ChordChart } from './ChordChart'
export { ChordProgression } from './progression'
export { ChordEditor } from './interactive'
export { LIGHT_THEME, DARK_THEME, resolveTheme } from './themes'
export { PRESETS, resolveInstrument } from './presets'
export { resolveConfig } from './defaults'
export { render } from './renderer'
export { noteAtFret, noteForFinger } from './music'
export { autoFinger } from './autofinger'
export { toSVGDataURL, toPNG, download } from './export'
export { generateAnimationCSS, resolveAnimation } from './animation'

export type {
  Finger,
  FingerShape,
  Barre,
  ChordDiagram,
  InstrumentConfig,
  InstrumentPreset,
  ChordTheme,
  ThemeInput,
  ChordChartOptions,
  ResolvedConfig,
  ChartLayout,
} from './types'

export type { AnimationOptions, AnimationInput } from './animation'
export type { PNGOptions, DownloadOptions } from './export'
export type { ChordProgressionOptions } from './progression'
export type { ChordEditorOptions } from './interactive'
export type { NoteStyle } from './music'
