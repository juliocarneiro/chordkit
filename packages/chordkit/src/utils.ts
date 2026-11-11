/** Escape special XML characters for safe SVG embedding (text nodes and attribute values) */
export function escapeXml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Round a number to 2 decimal places to keep SVG output clean */
export function round(n: number): number {
  return Math.round(n * 100) / 100
}

/** Make a font-family string safe for use inside XML double-quoted attributes */
export function safeFontFamily(ff: string): string {
  return String(ff)
    .replace(/"/g, "'")
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/** Short deterministic hash, used to derive ids that are stable across server and client renders */
export function hashString(input: string): string {
  let hash = 5381
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) | 0
  }
  return (hash >>> 0).toString(36)
}
