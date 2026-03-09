import type { InstrumentConfig, InstrumentPreset } from './types'

export const PRESETS: Record<InstrumentPreset, InstrumentConfig> = {
  guitar: {
    strings: 6,
    frets: 5,
    tuning: ['E', 'A', 'D', 'G', 'B', 'E'],
  },
  ukulele: {
    strings: 4,
    frets: 5,
    tuning: ['G', 'C', 'E', 'A'],
  },
  bass: {
    strings: 4,
    frets: 5,
    tuning: ['E', 'A', 'D', 'G'],
  },
  banjo: {
    strings: 5,
    frets: 5,
    tuning: ['G', 'D', 'G', 'B', 'D'],
  },
  cavaquinho: {
    strings: 4,
    frets: 5,
    tuning: ['D', 'G', 'B', 'D'],
  },
}

export function resolveInstrument(
  input?: InstrumentPreset | InstrumentConfig,
): InstrumentConfig {
  if (!input) return PRESETS.guitar

  if (typeof input === 'string') {
    const preset = PRESETS[input]
    if (!preset) {
      throw new Error(`Unknown instrument preset: "${input}". Available: ${Object.keys(PRESETS).join(', ')}`)
    }
    return preset
  }

  return {
    strings: input.strings,
    frets: input.frets,
    tuning: input.tuning,
  }
}
