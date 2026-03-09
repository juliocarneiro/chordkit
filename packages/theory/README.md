# @chordkit/theory

Music theory utilities for [chordkit](https://github.com/juliocarneiro/chordkit) — transpose chords, build scales, identify chords from notes, and more. Zero dependencies.

## Install

```bash
npm install chordkit @chordkit/theory
```

## Transpose

```typescript
import { transpose } from '@chordkit/theory'
import { guitar } from '@chordkit/dictionary'

const Bm     = transpose(guitar.Am, 2)            // Am → Bm (+2 semitones)
const Gm     = transpose(guitar.Am, -2)           // Am → Gm (-2 semitones)
const FSharpm = transpose(guitar.Em, 2, 'guitar') // Em → F#m
```

`transpose(chord, semitones, instrument?, style?)` recalculates all finger and barre positions on the fretboard for the given instrument tuning.

## Scales

```typescript
import { getScale, getScaleTypes } from '@chordkit/theory'

getScale('A', 'minor')           // ['A', 'B', 'C', 'D', 'E', 'F', 'G']
getScale('C', 'major')           // ['C', 'D', 'E', 'F', 'G', 'A', 'B']
getScale('E', 'pentatonicMinor') // ['E', 'G', 'A', 'B', 'D']
getScale('Bb', 'blues', 'flat')  // ['Bb', 'Db', 'Eb', 'E', 'F', 'Ab']

getScaleTypes()
// ['major', 'minor', 'harmonicMinor', 'melodicMinor', 'pentatonicMajor',
//  'pentatonicMinor', 'blues', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'locrian']
```

## Diatonic chords

```typescript
import { getDiatonicChords } from '@chordkit/theory'

getDiatonicChords('G', 'major')
// [
//   { degree: 'I',   name: 'G',    quality: 'major'      },
//   { degree: 'II',  name: 'Am',   quality: 'minor'      },
//   { degree: 'III', name: 'Bm',   quality: 'minor'      },
//   { degree: 'IV',  name: 'C',    quality: 'major'      },
//   { degree: 'V',   name: 'D',    quality: 'major'      },
//   { degree: 'VI',  name: 'Em',   quality: 'minor'      },
//   { degree: 'VII', name: 'F#dim',quality: 'diminished' },
// ]

getDiatonicChords('A', 'minor')
// I=Am, II=Bdim, III=C, IV=Dm, V=Em, VI=F, VII=G
```

## Chord identification

```typescript
import { identifyChord } from '@chordkit/theory'

identifyChord(['C', 'E', 'G'])        // 'C'
identifyChord(['A', 'C', 'E'])        // 'Am'
identifyChord(['B', 'D', 'F'])        // 'Bdim'
identifyChord(['G', 'B', 'D', 'F'])   // 'G7'
identifyChord(['C', 'E', 'G'], 'flat') // 'C'
```

> For more powerful detection with inversions, confidence scoring, and MIDI/frequency input, see [`@chordkit/detect`](../detect).

## Note utilities

```typescript
import { enharmonic, semitonesBetween, transposeNote, circleOfFifths } from '@chordkit/theory'

enharmonic('C#')              // 'Db'
enharmonic('Gb')              // 'F#'
enharmonic('E')               // 'E' (natural notes returned as-is)

semitonesBetween('A', 'C')    // 3
semitonesBetween('C', 'G')    // 7

transposeNote('E', 5)         // 'A'
transposeNote('Bb', -2, 'flat') // 'Ab'

circleOfFifths()
// ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F']
```

## API reference

### `transpose(chord, semitones, instrument?, style?)`

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `chord` | `ChordDiagram` | required | Source chord |
| `semitones` | `number` | required | Semitones to shift (positive = up, negative = down) |
| `instrument` | `InstrumentPreset \| InstrumentConfig` | `'guitar'` | Determines string tuning for fret recalculation |
| `style` | `'sharp' \| 'flat'` | inferred from chord name | Accidental preference for the transposed name |

### `getScale(root, type?, style?)`

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `root` | `string` | required | Root note (e.g. `'A'`, `'C#'`, `'Bb'`) |
| `type` | `ScaleType` | `'major'` | Scale type |
| `style` | `'sharp' \| 'flat'` | inferred from root | Accidental preference |

### `getDiatonicChords(root, scaleType?, style?)`

Returns an array of 7 `DiatonicChord` objects `{ degree, name, quality }`.

### `identifyChord(notes, style?)`

Returns the chord name string or `null` if no match is found.

## License

MIT
