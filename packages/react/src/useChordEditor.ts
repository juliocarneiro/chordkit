import { useRef, useState, useEffect, useCallback, type RefObject } from 'react'
import type { ChordDiagram, ChordEditorOptions } from 'chordkit'

export interface UseChordEditorOptions extends Omit<ChordEditorOptions, 'onChange'> {
  /** Called whenever the user modifies the chord */
  onChange?: (chord: ChordDiagram) => void
}

export interface UseChordEditorResult {
  /** Attach this ref to the container element */
  ref: RefObject<HTMLDivElement>
  /** Current chord state */
  chord: ChordDiagram | null
  /** Programmatically set a chord */
  setChord: (chord: ChordDiagram) => void
  /** Clear all finger positions */
  clear: () => void
}

let idCounter = 0
function uniqueId(): string {
  return `chordkit-editor-${++idCounter}`
}

/**
 * Hook that manages a ChordEditor instance tied to a container ref.
 * SSR-safe: the editor is only initialized in the browser.
 *
 * @example
 * function MyEditor() {
 *   const { ref, chord } = useChordEditor({ instrument: 'guitar', theme: 'dark' })
 *   return <div ref={ref} />
 * }
 */
export function useChordEditor(options: UseChordEditorOptions = {}): UseChordEditorResult {
  const { onChange, ...editorOptions } = options
  const ref = useRef<HTMLDivElement>(null)
  const [chord, setChordState] = useState<ChordDiagram | null>(null)
  const editorRef = useRef<import('chordkit').ChordEditor | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const idRef = useRef<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !ref.current) return

    const id = uniqueId()
    idRef.current = id
    ref.current.id = id

    let cancelled = false

    import('chordkit').then(({ ChordEditor }) => {
      if (cancelled || !ref.current) return
      editorRef.current = new ChordEditor(`#${id}`, {
        ...editorOptions,
        onChange: (updated) => {
          setChordState(updated)
          onChangeRef.current?.(updated)
        },
      })
    })

    return () => {
      cancelled = true
      editorRef.current = null
    }
    // Intentionally run only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setChord = useCallback((c: ChordDiagram) => {
    editorRef.current?.setChord(c)
    setChordState(c)
  }, [])

  const clear = useCallback(() => {
    editorRef.current?.clear()
    setChordState(null)
  }, [])

  return { ref, chord, setChord, clear }
}
