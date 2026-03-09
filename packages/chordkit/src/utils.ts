/** Escape special XML characters for safe SVG embedding */
export function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Generate a rounded rectangle SVG path */
export function roundedRect(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): string {
  r = Math.min(r, w / 2, h / 2)
  return [
    `M${x + r},${y}`,
    `h${w - 2 * r}`,
    `a${r},${r} 0 0 1 ${r},${r}`,
    `v${h - 2 * r}`,
    `a${r},${r} 0 0 1 -${r},${r}`,
    `h-${w - 2 * r}`,
    `a${r},${r} 0 0 1 -${r},-${r}`,
    `v-${h - 2 * r}`,
    `a${r},${r} 0 0 1 ${r},-${r}`,
    'Z',
  ].join(' ')
}

/** Generate an arc path for barre chords */
export function barrePath(
  x1: number,
  y: number,
  x2: number,
  height: number,
): string {
  const width = Math.abs(x2 - x1)
  const startX = Math.min(x1, x2)
  const controlY = y - height
  return [
    `M${startX},${y}`,
    `Q${startX + width / 2},${controlY} ${startX + width},${y}`,
  ].join(' ')
}

/** Round a number to 2 decimal places to keep SVG output clean */
export function round(n: number): number {
  return Math.round(n * 100) / 100
}

/** Make a font-family string safe for use inside XML double-quoted attributes */
export function safeFontFamily(ff: string): string {
  return ff.replace(/"/g, "'")
}
