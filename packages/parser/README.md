# @chordkit/parser

Parse chord names and chord sheets for [chordkit](https://github.com/juliocarneiro/chordkit). Handles complex chord names (`C#maj7`, `Bb9`, `Am7/G`), extracts chords from text lines, and parses lyrics with embedded chord markers. Zero dependencies.

## Install

```bash
npm install @chordkit/parser
```

## Parse a chord name

```typescript
import { parseChordName } from '@chordkit/parser'

parseChordName('Am7')
// { raw: 'Am7', root: 'A', quality: 'minor', extensions: ['7'], bass: undefined }

parseChordName('C#maj7')
// { raw: 'C#maj7', root: 'C#', quality: 'major', extensions: ['maj7'] }

parseChordName('Bb9')
// { raw: 'Bb9', root: 'Bb', quality: 'dominant', extensions: ['9'] }

parseChordName('G/B')
// { raw: 'G/B', root: 'G', quality: 'major', extensions: [], bass: 'B' }

parseChordName('Fdim7')
// { raw: 'Fdim7', root: 'F', quality: 'diminished', extensions: ['7'] }
```

Returns `null` for strings that are not recognizable chord names.

## Validate and format

```typescript
import { isValidChordName, formatChordName, parseChordName } from '@chordkit/parser'

isValidChordName('Am7')      // true
isValidChordName('Cmaj7')    // true
isValidChordName('hello')    // false
isValidChordName('H')        // false

const parsed = parseChordName('Dm7')!
formatChordName(parsed)      // 'Dm7'
```

## Parse a chord line

Extract all chord names from a whitespace-separated line. Non-chord tokens are ignored.

```typescript
import { parseLine } from '@chordkit/parser'

parseLine('Am  F  C  G')         // ['Am', 'F', 'C', 'G']
parseLine('Intro: Am F C G')     // ['Am', 'F', 'C', 'G']
parseLine('Verse: Dm7  G7  Cmaj7') // ['Dm7', 'G7', 'Cmaj7']
```

## Parse a chord sheet

Parses lyrics with chords wrapped in square brackets `[ChordName]`. Returns a line-by-line structure, each line containing segments with optional chord and associated text.

```typescript
import { parseChordSheet } from '@chordkit/parser'

const lines = parseChordSheet('[Am]Yesterday [F]all my [C]troubles [G]seemed so far away')

lines[0].segments
// [
//   { chord: { root: 'A', quality: 'minor', extensions: ['7'], ... }, text: 'Yesterday ' },
//   { chord: { root: 'F', quality: 'major', extensions: [],    ... }, text: 'all my ' },
//   { chord: { root: 'C', quality: 'major', extensions: [],    ... }, text: 'troubles ' },
//   { chord: { root: 'G', quality: 'major', extensions: [],    ... }, text: 'seemed so far away' },
// ]
```

Multi-line example:

```typescript
const sheet = parseChordSheet(`
[Am]Yesterday [F]all my [C]troubles [G]seemed so far away
[Am]Now it [F]looks as [C]though they're [G]here to stay
Oh, I [Dm]believe in [Am]yesterday
`)

for (const line of sheet) {
  for (const seg of line.segments) {
    if (seg.chord) {
      console.log(`[${seg.chord.raw}] → "${seg.text}"`)
    }
  }
}
```

## Supported chord syntax

| Pattern | Example | Quality |
|---------|---------|---------|
| Root only | `C`, `A#`, `Bb` | major |
| Minor | `Am`, `Dm`, `Bm` | minor |
| Diminished | `Bdim`, `F°` | diminished |
| Augmented | `Caug`, `D+` | augmented |
| Suspended | `Dsus2`, `Asus4`, `Asus` | suspended2 / suspended4 |
| Power chord | `E5`, `A5` | power |
| Dominant 7th | `G7`, `A7` | dominant |
| Major 7th | `Cmaj7`, `FMaj7` | major |
| Minor 7th | `Am7`, `Dm7` | minor |
| Extended | `C9`, `Dm9`, `Cmaj9` | dominant / major / minor |
| Added | `Cadd9`, `Gadd11` | add9 |
| Slash chord | `G/B`, `Am7/G` | any quality with bass |

## API reference

### `parseChordName(name)`

Returns `ParsedChord | null`.

```typescript
interface ParsedChord {
  raw: string          // original input string
  root: string         // root note: 'A', 'C#', 'Bb'
  quality: ChordQuality
  extensions: string[] // e.g. ['7'], ['maj7'], ['9']
  bass?: string        // bass note for slash chords
}

type ChordQuality =
  | 'major' | 'minor' | 'dominant' | 'diminished'
  | 'augmented' | 'suspended2' | 'suspended4' | 'power'
```

### `parseLine(line)`

Returns `string[]` — chord name strings found in the line.

### `parseChordSheet(text)`

Returns `ChordSheetLine[]`.

```typescript
interface ChordSheetLine {
  segments: ChordSheetSegment[]
}

interface ChordSheetSegment {
  text: string           // lyric text following the chord marker
  chord?: ParsedChord    // present when segment starts with [Chord]
}
```

### `formatChordName(parsed)`

Returns the chord name string reconstructed from a `ParsedChord`.

### `isValidChordName(name)`

Returns `boolean`.

## Related packages

| Package | Description |
|---------|-------------|
| [`chordkit`](https://github.com/juliocarneiro/chordkit/tree/main/packages/chordkit) | Core library — SVG rendering, themes, export, interactive editor |
| [`@chordkit/dictionary`](https://github.com/juliocarneiro/chordkit/tree/main/packages/dictionary) | Pre-built chord definitions for guitar, ukulele, and more |
| [`@chordkit/theory`](https://github.com/juliocarneiro/chordkit/tree/main/packages/theory) | Transpose chords, build scales, identify chords from notes |
| [`@chordkit/detect`](https://github.com/juliocarneiro/chordkit/tree/main/packages/detect) | Chord detection from MIDI numbers, frequencies, or note names |
| [`@chordkit/react`](https://github.com/juliocarneiro/chordkit/tree/main/packages/react) | React components — `<ChordChart>`, `<ChordEditor>`, `<ChordProgression>` |

## License

MIT
