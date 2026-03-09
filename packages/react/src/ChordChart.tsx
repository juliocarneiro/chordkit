import { useMemo, type CSSProperties } from 'react'
import { ChordChart as CoreChordChart } from 'chordkit'
import type { ChordChartOptions } from 'chordkit'

export interface ChordChartProps extends ChordChartOptions {
  className?: string
  style?: CSSProperties
}

/**
 * Renders a chord diagram SVG inline.
 * Accepts all ChordChartOptions plus optional className and style for the wrapper div.
 *
 * @example
 * <ChordChart chord={guitar.Am} theme="dark" />
 */
export function ChordChart({ className, style, ...options }: ChordChartProps) {
  const svg = useMemo(() => CoreChordChart.svg(options), [
    options.chord,
    options.instrument,
    options.theme,
    options.position,
    options.showTuning,
    options.showFretMarkers,
    options.orientation,
    options.leftHanded,
    options.noteLabels,
    options.autoFinger,
    options.animate,
    options.width,
    options.ariaTitle,
    options.ariaDescription,
  ])

  return (
    <div
      className={className}
      style={style}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
