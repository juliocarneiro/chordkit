/**
 * Convert an SVG string to a base64-encoded data URL (works in Node and browser).
 */
export function toSVGDataURL(svgString: string): string {
  if (typeof btoa === 'function') {
    const utf8 = encodeURIComponent(svgString).replace(
      /%([0-9A-F]{2})/g,
      (_, hex) => String.fromCharCode(parseInt(hex, 16)),
    )
    return `data:image/svg+xml;base64,${btoa(utf8)}`
  }
  const g = typeof globalThis !== 'undefined' ? globalThis : ({} as Record<string, unknown>)
  if (typeof (g as any).Buffer !== 'undefined') {
    const encoded = (g as any).Buffer.from(svgString, 'utf-8').toString('base64')
    return `data:image/svg+xml;base64,${encoded}`
  }
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`
}

export interface PNGOptions {
  /** Scale factor for higher resolution (default: 2) */
  scale?: number
  /** Explicit width for the output. If omitted, taken from the SVG. */
  width?: number
  /** Explicit height for the output. If omitted, derived from the SVG's aspect ratio. */
  height?: number
}

const finite = (n: number | undefined): number | undefined =>
  n !== undefined && Number.isFinite(n) && n > 0 ? n : undefined

/**
 * Make sure the root <svg> element carries pixel `width` and `height` attributes,
 * which browsers need to rasterize it at a predictable size.
 *
 * Only the root tag is inspected: attributes such as `stroke-width` or the
 * `height` of an inner <rect> do not count. Explicit `width`/`height` arguments
 * replace whatever the SVG declares; a missing side follows the viewBox ratio.
 */
export function ensureSvgDimensions(svgString: string, width?: number, height?: number): string {
  const tagMatch = svgString.match(/<svg\b[^>]*>/)
  if (!tagMatch) return svgString
  const tag = tagMatch[0]

  const readAttr = (name: string): number | undefined => {
    const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`))
    return m && /^\s*[\d.]+(px)?\s*$/.test(m[1]) ? finite(parseFloat(m[1])) : undefined
  }

  const viewBox = tag.match(/\sviewBox="\s*-?[\d.]+[\s,]+-?[\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)\s*"/)
  const vbW = viewBox ? finite(parseFloat(viewBox[1])) : undefined
  const vbH = viewBox ? finite(parseFloat(viewBox[2])) : undefined
  const ratio = vbW && vbH ? vbH / vbW : undefined

  const wantW = finite(width)
  const wantH = finite(height)
  const curW = readAttr('width')
  const curH = readAttr('height')

  let w: number
  let h: number
  if (wantW !== undefined || wantH !== undefined) {
    w = wantW ?? (ratio ? wantH! / ratio : curW ?? vbW ?? 260)
    h = wantH ?? (ratio ? w * ratio : curH ?? vbH ?? 300)
  } else if (curW !== undefined && curH !== undefined) {
    return svgString
  } else {
    w = curW ?? (curH !== undefined && ratio ? curH / ratio : vbW ?? 260)
    h = curH ?? (ratio ? w * ratio : vbH ?? 300)
  }

  const round = (n: number) => Math.round(n * 100) / 100
  const newTag = tag
    .replace(/\s(?:width|height)="[^"]*"/g, '')
    .replace(/^<svg\b/, `<svg width="${round(w)}" height="${round(h)}"`)

  return svgString.replace(tag, newTag)
}

/**
 * Convert an SVG string to a PNG Blob via Canvas (browser-only, async).
 */
export async function toPNG(svgString: string, options?: PNGOptions): Promise<Blob> {
  if (typeof document === 'undefined' || typeof Image === 'undefined') {
    throw new Error('toPNG requires a browser environment with Canvas support')
  }

  const scale = options?.scale ?? 2
  const svgWithDims = ensureSvgDimensions(svgString, options?.width, options?.height)
  const dataUrl = toSVGDataURL(svgWithDims)

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const w = img.naturalWidth || img.width
      const h = img.naturalHeight || img.height
      if (w === 0 || h === 0) {
        reject(new Error('SVG loaded with zero dimensions. Provide explicit width/height.'))
        return
      }
      const canvas = document.createElement('canvas')
      canvas.width = w * scale
      canvas.height = h * scale
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not get canvas 2D context'))
        return
      }
      ctx.scale(scale, scale)
      ctx.drawImage(img, 0, 0, w, h)
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Canvas toBlob returned null'))
      }, 'image/png')
    }
    img.onerror = () => reject(new Error('Failed to load SVG into Image element'))
    img.src = dataUrl
  })
}

export interface DownloadOptions extends PNGOptions {
  /** Filename without extension (default: 'chord') */
  filename?: string
  /** File format (default: 'png') */
  format?: 'png' | 'svg'
}

/**
 * Trigger a file download of the chord diagram (browser-only).
 */
export async function download(svgString: string, options?: DownloadOptions): Promise<void> {
  if (typeof document === 'undefined') {
    throw new Error('download requires a browser environment')
  }

  const filename = options?.filename ?? 'chord'
  const format = options?.format ?? 'png'

  let href: string
  let ext: string

  if (format === 'svg') {
    href = toSVGDataURL(svgString)
    ext = 'svg'
  } else {
    const blob = await toPNG(svgString, options)
    href = URL.createObjectURL(blob)
    ext = 'png'
  }

  const a = document.createElement('a')
  a.href = href
  a.download = `${filename}.${ext}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)

  if (format !== 'svg') {
    URL.revokeObjectURL(href)
  }
}
