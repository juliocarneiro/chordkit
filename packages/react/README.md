# @chordkit/react

React components and hooks for [chordkit](https://github.com/juliocarneiro/chordkit) — render chord diagrams, progressions, and interactive editors with zero boilerplate.

## Install

```bash
npm install chordkit @chordkit/react
```

Peer dependencies: `react >= 17`, `react-dom >= 17`.

## ChordChart

Renders a single chord diagram as an inline SVG. Accepts all [`ChordChartOptions`](https://github.com/juliocarneiro/chordkit#options) plus `className` and `style`.

```tsx
import { ChordChart } from '@chordkit/react'
import { guitar } from '@chordkit/dictionary'

function App() {
  return (
    <ChordChart
      chord={guitar.Am}
      theme="dark"
      width={260}
    />
  )
}
```

With all options:

```tsx
<ChordChart
  chord={guitar.F}
  instrument="guitar"
  theme="light"
  autoFinger
  noteLabels="sharp"
  leftHanded={false}
  animate={{ loop: true }}
  width={200}
  className="my-chord"
  style={{ display: 'inline-block' }}
/>
```

## ChordProgression

Renders multiple chord diagrams side by side in a single SVG.

```tsx
import { ChordProgression } from '@chordkit/react'
import { guitar } from '@chordkit/dictionary'

function App() {
  return (
    <ChordProgression
      chords={[guitar.Am, guitar.F, guitar.C, guitar.G]}
      instrument="guitar"
      theme="dark"
      spacing={16}
      chordWidth={200}
      title="Verse"
    />
  )
}
```

## ChordEditor

Interactive chord editor — click fret positions to place/remove fingers, click string tops to toggle open/muted. Browser-only; renders an empty div during SSR.

```tsx
import { ChordEditor } from '@chordkit/react'
import { guitar } from '@chordkit/dictionary'

function App() {
  return (
    <ChordEditor
      instrument="guitar"
      theme="light"
      initialChord={guitar.Am}
      onChange={(chord) => console.log(chord)}
    />
  )
}
```

### ChordEditor props

| Prop | Type | Description |
|------|------|-------------|
| `instrument` | `string \| object` | Instrument preset or custom config |
| `theme` | `string \| object` | Theme preset or custom |
| `leftHanded` | `boolean` | Mirror the editor for left-handed players |
| `width` | `number` | Editor width in pixels |
| `initialChord` | `ChordDiagram` | Chord to pre-load on mount |
| `onChange` | `(chord: ChordDiagram) => void` | Called on every user interaction |
| `className` | `string` | CSS class for the wrapper div |
| `style` | `CSSProperties` | Inline styles for the wrapper div |

## useChordEditor hook

For full programmatic control over the editor instance.

```tsx
import { useChordEditor } from '@chordkit/react'
import { guitar } from '@chordkit/dictionary'

function MyEditor() {
  const { ref, chord, setChord, clear } = useChordEditor({
    instrument: 'guitar',
    theme: 'dark',
    onChange: (c) => console.log('changed', c),
  })

  return (
    <div>
      <div ref={ref} />

      <button onClick={() => setChord(guitar.Am)}>Load Am</button>
      <button onClick={() => setChord(guitar.G)}>Load G</button>
      <button onClick={clear}>Clear</button>

      {chord && (
        <pre>{JSON.stringify(chord, null, 2)}</pre>
      )}
    </div>
  )
}
```

### Hook return value

| Key | Type | Description |
|-----|------|-------------|
| `ref` | `RefObject<HTMLDivElement>` | Attach to the container element |
| `chord` | `ChordDiagram \| null` | Current chord state (updates on every click) |
| `setChord` | `(chord: ChordDiagram) => void` | Load a chord programmatically |
| `clear` | `() => void` | Remove all fingers and reset string states |

## SSR

`ChordChart` and `ChordProgression` are fully SSR-safe — they call `ChordChart.svg()` synchronously (no DOM access).

`ChordEditor` and `useChordEditor` initialize the interactive layer only in the browser (`typeof window !== 'undefined'`). During SSR they render an empty `<div>` without errors.

## Related packages

| Package | Description |
|---------|-------------|
| [`chordkit`](../chordkit) | Core library — SVG rendering, themes, export, interactive editor |
| [`@chordkit/dictionary`](../dictionary) | Pre-built chord definitions for guitar, ukulele, and more |
| [`@chordkit/theory`](../theory) | Transpose chords, build scales, identify chords from notes |
| [`@chordkit/parser`](../parser) | Parse chord names and chord sheets with embedded `[Am]` markers |
| [`@chordkit/detect`](../detect) | Chord detection from MIDI numbers, frequencies, or note names |

## License

MIT
