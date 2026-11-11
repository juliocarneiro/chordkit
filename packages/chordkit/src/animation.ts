export interface AnimationOptions {
  /** Total animation duration in ms (default: 800) */
  duration?: number
  /** Stagger delay between each finger in ms (default: 100) */
  stagger?: number
  /** Strum direction (default: 'down') */
  direction?: 'down' | 'up'
  /** Loop the animation (default: false) */
  loop?: boolean
}

export type AnimationInput = boolean | AnimationOptions

const DEFAULTS: Required<AnimationOptions> = {
  duration: 800,
  stagger: 100,
  direction: 'down',
  loop: false,
}

export function resolveAnimation(input?: AnimationInput): AnimationOptions | null {
  if (!input) return null
  if (input === true) return { ...DEFAULTS }
  return { ...DEFAULTS, ...input }
}

const ms = (value: unknown, fallback: number): number => {
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? n : fallback
}

/**
 * Generate a <style> block with CSS keyframes for strum animation.
 * Each finger dot/barre gets a staggered fade-in + scale-up.
 *
 * @param classPrefix - Prefix for the generated class names. Styles inside an inline SVG
 *   apply to the whole page, so each chart needs its own prefix.
 */
export function generateAnimationCSS(
  fingerCount: number,
  barreCount: number,
  opts: AnimationOptions,
  classPrefix = 'ck-',
): string {
  const duration = ms(opts.duration, DEFAULTS.duration)
  const stagger = ms(opts.stagger, DEFAULTS.stagger)
  const loop = opts.loop ?? DEFAULTS.loop
  const direction = opts.direction ?? DEFAULTS.direction

  const iteration = loop ? 'infinite' : '1'
  const easing = 'cubic-bezier(0.34, 1.56, 0.64, 1)'
  // fill-box makes each shape scale around its own centre instead of the SVG's.
  const origin = 'transform-box: fill-box; transform-origin: center center;'

  const lines: string[] = [
    '<style>',
    '  @keyframes ck-pop { 0% { opacity: 0; transform: scale(0); } 100% { opacity: 1; transform: scale(1); } }',
    '  @keyframes ck-barre-grow { 0% { opacity: 0; transform: scaleX(0); } 100% { opacity: 1; transform: scaleX(1); } }',
  ]

  const classes: string[] = []
  const totalElements = barreCount + fingerCount
  for (let i = 0; i < totalElements; i++) {
    const index = direction === 'up' ? totalElements - 1 - i : i
    const delay = index * stagger
    const isBarre = i < barreCount
    const cls = isBarre ? `${classPrefix}barre-${i}` : `${classPrefix}dot-${i - barreCount}`
    const anim = isBarre ? 'ck-barre-grow' : 'ck-pop'
    classes.push(`.${cls}`)
    lines.push(
      `  .${cls} { opacity: 0; ${origin} animation: ${anim} ${duration}ms ${easing} ${delay}ms ${iteration} forwards; }`,
    )
  }

  if (classes.length > 0) {
    lines.push(
      `  @media (prefers-reduced-motion: reduce) { ${classes.join(', ')} { animation: none; opacity: 1; } }`,
    )
  }

  lines.push('</style>')
  return lines.join('\n')
}
