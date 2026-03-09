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
  /** Explicit width for the output. If omitted, extracted from SVG viewBox. */
  width?: number
  /** Explicit height for the output. If omitted, extracted from SVG viewBox. */
  height?: number
}

function ensureSvgDimensions(svgString: string, width?: number, height?: number): string {
  const viewBoxMatch = svgString.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/)
  const w = width ?? (viewBoxMatch ? parseFloat(viewBoxMatch[1]) : 260)
  const h = height ?? (viewBoxMatch ? parseFloat(viewBoxMatch[2]) : 300)

  if (/\bwidth="/.test(svgString) && /\bheight="/.test(svgString)) {
    return svgString
  }

  return svgString.replace(
    '<svg ',
    `<svg width="${w}" height="${h}" `,
  )
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
