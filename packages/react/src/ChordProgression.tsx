import { useMemo, type CSSProperties } from 'react'
import { ChordProgression as CoreChordProgression } from 'chordkit'
import type { ChordProgressionOptions } from 'chordkit'

export interface ChordProgressionProps extends ChordProgressionOptions {
  className?: string
  style?: CSSProperties
}

/**
 * Renders multiple chord diagrams side by side in a single SVG.
 *
 * @example
 * <ChordProgression chords={[guitar.Am, guitar.F, guitar.C, guitar.G]} theme="dark" />
 */
export function ChordProgression({ className, style, ...options }: ChordProgressionProps) {
  const svg = useMemo(
    () => CoreChordProgression.svg(options),
    // Serialize chords array to detect changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(options)],
  )

  return (
    <div
      className={className}
      style={style}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
