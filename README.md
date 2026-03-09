# chordkit

Modern, accessible SVG chord diagram generator for any stringed instrument. Zero dependencies, ~6KB gzipped.

## Packages

| Package | Description | Install |
|---------|-------------|---------|
| [`chordkit`](./packages/chordkit) | Core library — SVG rendering, themes, export, editor | `npm install chordkit` |
| [`@chordkit/dictionary`](./packages/dictionary) | Pre-built chord definitions for guitar, ukulele, and more | `npm install @chordkit/dictionary` |

## Features

- **Zero dependencies** — pure SVG string generation, no DOM library required
- **Accessible** — ARIA labels, `<title>`, `<desc>` for screen readers, WCAG 2.1 AA compliant themes
- **Multi-instrument** — guitar, ukulele, bass, banjo, cavaquinho, or any custom config
- **SSR ready** — works in Node.js, Deno, edge functions — no DOM needed
- **Themeable** — built-in light/dark themes, fully customizable
- **Left-handed mode** — mirrors the entire diagram for left-handed players
- **Note labels** — show real note names (C, E, G) on finger dots
- **Auto-fingering** — automatically assigns finger numbers (1-4) using ergonomic heuristics
- **Strum animation** — CSS/SVG native animation, zero JS runtime
- **Chord progression** — render multiple chords side by side in a single SVG
- **Export** — PNG, SVG data URL, or direct file download
- **Interactive editor** — click on fret positions to build chords visually (browser)
- **Tiny** — ~6KB gzipped with all features, tree-shakeable
- **TypeScript** — full type definitions included

## Quick Start

```bash
npm install chordkit
```

### Static SVG string (SSR / Node.js)

```typescript
import { ChordChart } from 'chordkit'

const svg = ChordChart.svg({
  instrument: 'guitar',
  chord: {
    name: 'Am',
    fingers: [
      { string: 2, fret: 1 },
      { string: 3, fret: 2 },
      { string: 4, fret: 2 },
    ],
    muted: [6],
    open: [1, 5],
  },
  theme: 'dark',
})
```

### Builder API (Browser)

```typescript
import { ChordChart } from 'chordkit'

new ChordChart('#my-container')
  .instrument('guitar')
  .chord({
    name: 'G',
    fingers: [
      { string: 1, fret: 3 },
      { string: 5, fret: 2 },
      { string: 6, fret: 3 },
    ],
    open: [2, 3, 4],
  })
  .theme('light')
  .draw()
```

### With the chord dictionary

```bash
npm install @chordkit/dictionary
```

```typescript
import { ChordChart } from 'chordkit'
import { guitar, ukulele } from '@chordkit/dictionary'

const svg = ChordChart.svg({ chord: guitar.Am, theme: 'dark' })

const svg2 = ChordChart.svg({
  chord: ukulele.C,
  instrument: 'ukulele',
})
```

## Instruments

Built-in presets: `'guitar'`, `'ukulele'`, `'bass'`, `'banjo'`, `'cavaquinho'`.

Or pass a custom config:

```typescript
ChordChart.svg({
  instrument: { strings: 7, frets: 6, tuning: ['B','E','A','D','G','B','E'] },
  chord: { ... },
})
```

## Themes

Two built-in themes: `'light'` and `'dark'`. You can also pass a partial object to customize:

```typescript
ChordChart.svg({
  chord: { ... },
  theme: {
    background: '#0d1117',
    dotColor: '#58a6ff',
    nutColor: '#f0f6fc',
  },
})
```

### Theme properties

| Property | Description |
|---|---|
| `background` | Background color |
| `fretColor` | Fret line color |
| `stringColor` | String line color |
| `dotColor` | Finger dot color |
| `dotTextColor` | Text inside finger dots |
| `nutColor` | Nut (top bar) color |
| `textColor` | Title and label color |
| `mutedColor` | Muted string (X) indicator color |
| `openColor` | Open string (O) indicator color |
| `barreColor` | Barre chord bar color |
| `barreTextColor` | Text on barre bar |
| `fontFamily` | Font family for all text |
| `fretMarkerColor` | Fret position marker dot color |

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `instrument` | `string \| object` | `'guitar'` | Instrument preset or custom config |
| `chord` | `ChordDiagram` | required | Chord data |
| `position` | `number` | `1` | Starting fret |
| `theme` | `string \| object` | `'light'` | Theme preset or custom |
| `showTuning` | `boolean` | `true` | Show tuning labels |
| `showFretMarkers` | `boolean` | `true` | Show fret marker dots |
| `orientation` | `string` | `'vertical'` | `'vertical'` or `'horizontal'` |
| `leftHanded` | `boolean` | `false` | Mirror diagram for left-handed players |
| `noteLabels` | `boolean \| 'sharp' \| 'flat'` | `false` | Show note names on finger dots |
| `autoFinger` | `boolean` | `false` | Auto-assign finger numbers 1-4 |
| `animate` | `boolean \| AnimationOptions` | `false` | Strum animation (CSS/SVG native) |
| `width` | `number` | `260` | Width in pixels |
| `ariaTitle` | `string` | auto | Custom accessible title |
| `ariaDescription` | `string` | auto | Custom accessible description |

## Left-handed mode

Mirrors the entire diagram so left-handed players see the chord from their perspective — strings, finger dots, barres, tuning labels and position markers are all flipped.

```typescript
ChordChart.svg({
  chord: { name: 'Am', fingers: [...], muted: [6], open: [1, 5] },
  leftHanded: true,
})

// Builder API
new ChordChart('#container')
  .chord({ name: 'Am', fingers: [...] })
  .leftHanded()
  .draw()
```

## Note labels

Display the real note names (C, E, G, etc.) on each finger dot, calculated from the instrument tuning. Great for learning music theory.

```typescript
// Sharp notation (default): C#, F#, G#
ChordChart.svg({ chord: guitar.Am, noteLabels: true })

// Flat notation: Db, Gb, Ab
ChordChart.svg({ chord: guitar.Am, noteLabels: 'flat' })

// Builder API
new ChordChart('#el').chord(guitar.Am).noteLabels('sharp').draw()
```

## Auto-fingering

Automatically assigns finger numbers (1 = index, 2 = middle, 3 = ring, 4 = pinky) using ergonomic heuristics. Barre chords always get finger 1.

```typescript
ChordChart.svg({ chord: guitar.F, autoFinger: true })

// Or use the function directly
import { autoFinger } from 'chordkit'
const annotated = autoFinger(myChord) // returns new ChordDiagram with finger.text filled
```

## Strum animation

Pure CSS/SVG animation embedded in the SVG output — zero JS runtime. Each finger dot pops in with a staggered delay, barres expand smoothly.

```typescript
// Simple — uses defaults (800ms, stagger 100ms, down direction)
ChordChart.svg({ chord: guitar.Am, animate: true })

// Custom options
ChordChart.svg({
  chord: guitar.Am,
  animate: {
    duration: 1200,   // total animation time in ms
    stagger: 80,      // delay between each finger in ms
    direction: 'up',  // 'down' or 'up' strum direction
    loop: true,       // repeat the animation
  },
})

// Builder API
new ChordChart('#el').chord(guitar.Am).animate({ loop: true }).draw()
```

## Chord progression

Render multiple chords side by side in a single SVG. Perfect for song sheets and chord charts.

```typescript
import { ChordProgression } from 'chordkit'
import { guitar } from '@chordkit/dictionary'

const svg = ChordProgression.svg({
  chords: [guitar.Am, guitar.F, guitar.C, guitar.G],
  instrument: 'guitar',
  theme: 'dark',
  spacing: 16,         // gap between chords in px
  chordWidth: 200,     // width of each chord diagram
  title: 'Verse',      // optional progression title
})
```

## Export (PNG / Data URL / Download)

Convert chord diagrams to images for saving, sharing, or embedding.

```typescript
import { ChordChart, toSVGDataURL } from 'chordkit'

// SVG as base64 data URL (works in Node.js and browser)
const dataUrl = ChordChart.toSVGDataURL(options)
// Use in <img src="..."> or embed in emails

// PNG via Canvas (browser-only, async)
const blob = await ChordChart.toPNG(options, { scale: 2 })

// Direct file download (browser-only)
await ChordChart.download(options, {
  filename: 'Am',
  format: 'png',   // 'png' or 'svg'
  scale: 2,
})

// You can also use the standalone function
const url = toSVGDataURL(anySvgString)
```

## Interactive chord editor

A browser-based editor where users click on fret positions to build chords visually. Click on string tops to toggle open/muted state.

```typescript
import { ChordEditor } from 'chordkit'
import { guitar } from '@chordkit/dictionary'

const editor = new ChordEditor('#container', {
  instrument: 'guitar',
  theme: 'light',
  onChange: (chord) => {
    console.log(chord) // ChordDiagram updated on every click
  },
})

// Load an existing chord
editor.setChord(guitar.Am)

// Read the current chord
const chord = editor.getChord()

// Clear everything
editor.clear()
```

## Chord dictionary

The optional `@chordkit/dictionary` package provides ready-to-use chord definitions so you don't have to define them manually.

```bash
npm install @chordkit/dictionary
```

### Available chords

#### Guitar

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

#### Ukulele

| Major | Minor |
|-------|-------|
| C | Cm |
| D | Dm |
| E | Em |
| F | Gm |
| G | Am |
| A | Bm |
| B | |

### Chord structure

Each chord follows the `ChordDiagram` type:

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

## Accessibility

Every generated SVG includes:

- `role="img"` on the root element
- `<title>` with the chord name (e.g., "Chord diagram: Am")
- `<desc>` with a full textual description of the chord
- `aria-label` on muted/open string indicators
- WCAG 2.1 AA compliant contrast in built-in themes

## Contributing

```bash
# Clone the repo
git clone https://github.com/juliocarneiro/chordkit.git
cd chordkit

# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test
```

## License

MIT
