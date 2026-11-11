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

type CoreChordEditor = import('chordkit').ChordEditor

/**
 * Hook that manages a ChordEditor instance tied to a container ref.
 * SSR-safe: the editor is only initialized in the browser.
 *
 * `initialChord` is read once, when the editor is created. Every other option
 * (theme, instrument, orientation, width, leftHanded) is applied whenever it changes.
 *
 * @example
 * function MyEditor() {
 *   const { ref, chord } = useChordEditor({ instrument: 'guitar', theme: 'dark' })
 *   return <div ref={ref} />
 * }
 */
export function useChordEditor(options: UseChordEditorOptions = {}): UseChordEditorResult {
  const { onChange, initialChord, ...editorOptions } = options
  const ref = useRef<HTMLDivElement>(null)
  const [chord, setChordState] = useState<ChordDiagram | null>(null)
  const editorRef = useRef<CoreChordEditor | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const optionsRef = useRef(editorOptions)
  optionsRef.current = editorOptions
  // The editor loads asynchronously; a chord set before it exists waits here.
  const pendingChordRef = useRef<ChordDiagram | undefined>(initialChord)

  useEffect(() => {
    const element = ref.current
    if (typeof window === 'undefined' || !element) return

    let cancelled = false
    let editor: CoreChordEditor | null = null

    import('chordkit').then(({ ChordEditor }) => {
      if (cancelled) return
      editor = new ChordEditor(element, {
        ...optionsRef.current,
        initialChord: pendingChordRef.current,
        onChange: (updated) => {
          setChordState(updated)
          onChangeRef.current?.(updated)
        },
      })
      editorRef.current = editor
    })

    return () => {
      cancelled = true
      editor?.destroy()
      editorRef.current = null
    }
  }, [])

  const { instrument, theme, leftHanded, orientation, width } = editorOptions
  const optionsKey = JSON.stringify([instrument, theme, leftHanded, orientation, width])

  useEffect(() => {
    // No-op until the editor exists; it is created with the latest options anyway.
    editorRef.current?.setOptions(optionsRef.current)
  }, [optionsKey])

  const setChord = useCallback((c: ChordDiagram) => {
    pendingChordRef.current = c
    editorRef.current?.setChord(c)
    setChordState(c)
  }, [])

  const clear = useCallback(() => {
    pendingChordRef.current = undefined
    editorRef.current?.clear()
    setChordState(null)
  }, [])

  return { ref, chord, setChord, clear }
}
