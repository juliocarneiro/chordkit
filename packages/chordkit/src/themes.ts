import type { ChordTheme, ThemeInput } from './types'

export const LIGHT_THEME: ChordTheme = {
  background: '#ffffff',
  fretColor: '#c4c4c4',
  stringColor: '#8a8a8a',
  dotColor: '#1a1a2e',
  dotTextColor: '#ffffff',
  nutColor: '#1a1a2e',
  textColor: '#1a1a2e',
  mutedColor: '#b0b0b0',
  openColor: '#4a9c6d',
  barreColor: '#1a1a2e',
  barreTextColor: '#ffffff',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  fretMarkerColor: '#e0e0e0',
}

export const DARK_THEME: ChordTheme = {
  background: '#1a1a2e',
  fretColor: '#4a4a5e',
  stringColor: '#6a6a7e',
  dotColor: '#e8e8e8',
  dotTextColor: '#1a1a2e',
  nutColor: '#e8e8e8',
  textColor: '#e8e8e8',
  mutedColor: '#6a6a7e',
  openColor: '#6dd4a0',
  barreColor: '#e8e8e8',
  barreTextColor: '#1a1a2e',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  fretMarkerColor: '#2a2a3e',
}

const BUILTIN_THEMES: Record<string, ChordTheme> = {
  light: LIGHT_THEME,
  dark: DARK_THEME,
}

export function resolveTheme(input?: ThemeInput): ChordTheme {
  if (!input) return LIGHT_THEME

  if (typeof input === 'string') {
    const theme = BUILTIN_THEMES[input]
    if (!theme) {
      throw new Error(`Unknown theme: "${input}". Available: ${Object.keys(BUILTIN_THEMES).join(', ')}`)
    }
    return theme
  }

  return { ...LIGHT_THEME, ...input }
}
