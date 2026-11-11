import { useEffect, useRef, type CSSProperties } from 'react'
import type { ChordDiagram } from 'chordkit'
import type { UseChordEditorOptions } from './useChordEditor'
import { useChordEditor } from './useChordEditor'

export interface ChordEditorProps extends UseChordEditorOptions {
  /** Chord to pre-load into the editor. Passing a new object loads that chord. */
  initialChord?: ChordDiagram
  className?: string
  style?: CSSProperties
}

/**
 * Interactive chord editor component.
 * Click on fret positions to place or remove fingers.
 * Click on string tops to toggle open/muted state.
 * Both also work from the keyboard (Tab, then Enter or Space).
 *
 * Browser-only — safely renders an empty div during SSR.
 *
 * @example
 * <ChordEditor
 *   instrument="guitar"
 *   theme="light"
 *   onChange={(chord) => console.log(chord)}
 * />
 */
export function ChordEditor({ initialChord, className, style, ...options }: ChordEditorProps) {
  const { ref, setChord } = useChordEditor({ ...options, initialChord })
  const isFirstRender = useRef(true)

  useEffect(() => {
    // The hook already loads the chord it was created with; only react to later changes.
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (initialChord) setChord(initialChord)
    // Only run when initialChord identity changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialChord])

  return <div ref={ref} className={className} style={style} />
}
