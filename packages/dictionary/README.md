# @chordkit/dictionary

Pre-built chord definitions for [chordkit](https://github.com/juliocarneiro/chordkit). Ready-to-use voicings for guitar, ukulele, and more.

## Install

```bash
npm install chordkit @chordkit/dictionary
```

## Usage

```typescript
import { ChordChart } from 'chordkit'
import { guitar, ukulele } from '@chordkit/dictionary'

// Render a guitar chord
const svg = ChordChart.svg({ chord: guitar.Am, theme: 'dark' })

// Render a ukulele chord
const svg2 = ChordChart.svg({
  chord: ukulele.C,
  instrument: 'ukulele',
})

// Builder API
new ChordChart('#container')
  .chord(guitar.G)
  .theme('light')
  .draw()
```

## Available chords

### Guitar

| Major | Minor | 7th |
|-------|-------|-----|
| C | Dm | C7 |
| D | Em | D7 |
| E | Am | E7 |
| F | Bm | G7 |
| G | | A7 |
| A | | Am7 |
| B | | Dm7 |
| | | Em7 |

### Ukulele

| Major | Minor |
|-------|-------|
| C | Cm |
| D | Dm |
| E | Em |
| F | Gm |
| G | Am |
| A | Bm |
| B | |

## Chord structure

Each chord follows the `ChordDiagram` type from `chordkit`:

```typescript
interface ChordDiagram {
  name?: string
  fingers: { string: number; fret: number; text?: string }[]
  barres?: { fret: number; fromString: number; toString: number }[]
  muted?: number[]
  open?: number[]
  position?: number
}
```

## Examples

```typescript
import { ChordChart, ChordProgression } from 'chordkit'
import { guitar } from '@chordkit/dictionary'

// With note labels
ChordChart.svg({ chord: guitar.Am, noteLabels: true })

// With auto-fingering
ChordChart.svg({ chord: guitar.F, autoFinger: true })

// Chord progression
ChordProgression.svg({
  chords: [guitar.Am, guitar.F, guitar.C, guitar.G],
  title: 'Verse',
  theme: 'dark',
})

// Left-handed
ChordChart.svg({ chord: guitar.E, leftHanded: true })
```

## Related packages

| Package | Description |
|---------|-------------|
| [`chordkit`](https://github.com/juliocarneiro/chordkit/tree/main/packages/chordkit) | Core library — SVG rendering, themes, export, interactive editor |
| [`@chordkit/theory`](https://github.com/juliocarneiro/chordkit/tree/main/packages/theory) | Transpose chords, build scales, identify chords from notes |
| [`@chordkit/parser`](https://github.com/juliocarneiro/chordkit/tree/main/packages/parser) | Parse chord names and chord sheets with embedded `[Am]` markers |
| [`@chordkit/detect`](https://github.com/juliocarneiro/chordkit/tree/main/packages/detect) | Chord detection from MIDI numbers, frequencies, or note names |
| [`@chordkit/react`](https://github.com/juliocarneiro/chordkit/tree/main/packages/react) | React components — `<ChordChart>`, `<ChordEditor>`, `<ChordProgression>` |

## License

MIT
