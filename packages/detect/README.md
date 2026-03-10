# @chordkit/detect

Chord detection for [chordkit](https://github.com/juliocarneiro/chordkit) — identify chords from note names, MIDI note numbers, or audio frequencies. Returns multiple ranked candidates with confidence scores and inversion detection. Zero dependencies.

## Install

```bash
npm install @chordkit/detect
```

## Detect from note names

```typescript
import { detectChord } from '@chordkit/detect'

detectChord(['A', 'C', 'E'])
// [{ name: 'Am', root: 'A', quality: 'minor', inversion: 0, score: 1, matchedNotes: ['A','C','E'] }]

detectChord(['C', 'E', 'G', 'B'])
// [
//   { name: 'Cmaj7', quality: 'major7',  inversion: 0, score: 1    },
//   { name: 'Em',    quality: 'minor',   inversion: 1, score: 0.75 },
//   ...
// ]

// First inversion: E in bass
detectChord(['E', 'A', 'C'])
// [{ name: 'Am', inversion: 1, score: 1, ... }]

// Flat notation
detectChord(['Bb', 'D', 'F'], { style: 'flat' })
// [{ name: 'Bb', root: 'Bb', quality: 'major', score: 1 }]
```

## Detect from MIDI note numbers

MIDI notes are sorted by pitch, so the lowest becomes the bass for inversion detection.

```typescript
import { detectChordFromMidi } from '@chordkit/detect'

detectChordFromMidi([57, 60, 64])     // A3, C4, E4 → Am
detectChordFromMidi([60, 64, 67])     // C4, E4, G4 → C
detectChordFromMidi([64, 67, 71, 74]) // E4, G4, B4, D5 → Em7
detectChordFromMidi([55, 59, 62, 65]) // G3, B3, D4, F4 → G7
```

## Detect from audio frequencies (Hz)

Each frequency is snapped to the nearest MIDI semitone before matching. Useful with Web Audio API FFT pitch detection.

```typescript
import { detectChordFromFrequencies } from '@chordkit/detect'

// A3=220Hz, C4=261.63Hz, E4=329.63Hz
detectChordFromFrequencies([220, 261.63, 329.63])
// [{ name: 'Am', score: 1, inversion: 0 }]

// Slight detuning is handled automatically
detectChordFromFrequencies([219.5, 262, 330])
// [{ name: 'Am', score: 1 }]
```

## MIDI utilities

```typescript
import { midiToNote, noteToMidi } from '@chordkit/detect'

midiToNote(60)            // { midi: 60, name: 'C',  octave: 4, frequency: 261.63 }
midiToNote(69)            // { midi: 69, name: 'A',  octave: 4, frequency: 440.00 }
midiToNote(70, 'flat')    // { midi: 70, name: 'Bb', octave: 4, frequency: 466.16 }
midiToNote(127)           // { midi: 127, name: 'G', octave: 9, frequency: 12543.85 }

noteToMidi('A', 4)        // 69
noteToMidi('C', 4)        // 60
noteToMidi('Bb', 3)       // 46
```

## Frequency utilities

```typescript
import { frequencyToNote, frequencyToMidi, centDeviation } from '@chordkit/detect'

frequencyToNote(440)      // { midi: 69, name: 'A', octave: 4, frequency: 440 }
frequencyToNote(432)      // snaps to nearest semitone → A4 (midi: 69)
frequencyToNote(261.63)   // { midi: 60, name: 'C', octave: 4, ... }

frequencyToMidi(440)      // 69
frequencyToMidi(8.18)     // 0 (lowest MIDI note)

centDeviation(445)        // +19  (19 cents sharp)
centDeviation(435)        // -19  (19 cents flat)
centDeviation(440)        // 0    (in tune)
```

## Options

All three detection functions accept an optional `DetectOptions` object:

```typescript
detectChord(notes, {
  style: 'flat',        // accidental preference for names (default: 'sharp')
  maxCandidates: 3,     // maximum number of results returned (default: 5)
  minScore: 0.5,        // minimum confidence threshold 0–1 (default: 0.4)
})
```

## Candidate type

```typescript
interface ChordCandidate {
  name: string           // full chord name, e.g. "Am7"
  root: string           // root note, e.g. "A"
  quality: ChordQuality  // e.g. "minor7"
  inversion: number      // 0 = root position, 1 = 1st inv., 2 = 2nd inv., 3 = 3rd inv.
  score: number          // confidence 0–1 (1 = perfect match, no extra notes)
  matchedNotes: string[] // input notes that matched the chord pattern
}
```

The `score` starts at 1 for a perfect match and is reduced by ~0.08 for each extra note in the input that is not part of the chord pattern.

## Supported chord types

| Type | Example | Intervals |
|------|---------|-----------|
| Major triad | C | 0-4-7 |
| Minor triad | Am | 0-3-7 |
| Diminished | Bdim | 0-3-6 |
| Augmented | Caug | 0-4-8 |
| Suspended 2 | Dsus2 | 0-2-7 |
| Suspended 4 | Asus4 | 0-5-7 |
| Power chord | E5 | 0-7 |
| Dominant 7th | G7 | 0-4-7-10 |
| Major 7th | Cmaj7 | 0-4-7-11 |
| Minor 7th | Am7 | 0-3-7-10 |
| Diminished 7th | Bdim7 | 0-3-6-9 |
| Half-diminished | Bm7b5 | 0-3-6-10 |
| Augmented 7th | Caug7 | 0-4-8-10 |
| Add9 | Cadd9 | 0-4-7-14 |
| Dominant 9th | G9 | 0-4-7-10-2 |
| Major 9th | Cmaj9 | 0-4-7-11-2 |
| Minor 9th | Am9 | 0-3-7-10-2 |

## Related packages

| Package | Description |
|---------|-------------|
| [`chordkit`](../chordkit) | Core library — SVG rendering, themes, export, interactive editor |
| [`@chordkit/dictionary`](../dictionary) | Pre-built chord definitions for guitar, ukulele, and more |
| [`@chordkit/theory`](../theory) | Transpose chords, build scales, identify chords from notes |
| [`@chordkit/parser`](../parser) | Parse chord names and chord sheets with embedded `[Am]` markers |
| [`@chordkit/react`](../react) | React components — `<ChordChart>`, `<ChordEditor>`, `<ChordProgression>` |

## License

MIT
