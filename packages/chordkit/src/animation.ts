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

/**
 * Generate a <style> block with CSS keyframes for strum animation.
 * Each finger dot/barre gets a staggered fade-in + scale-up.
 */
export function generateAnimationCSS(
  fingerCount: number,
  barreCount: number,
  opts: AnimationOptions,
): string {
  const duration = opts.duration ?? DEFAULTS.duration
  const stagger = opts.stagger ?? DEFAULTS.stagger
  const loop = opts.loop ?? DEFAULTS.loop
  const direction = opts.direction ?? DEFAULTS.direction

  const iteration = loop ? 'infinite' : '1'
  const easing = 'cubic-bezier(0.34, 1.56, 0.64, 1)'

  const lines: string[] = [
    '<style>',
    '  @keyframes ck-pop { 0% { opacity: 0; transform: scale(0); } 100% { opacity: 1; transform: scale(1); } }',
    '  @keyframes ck-barre-grow { 0% { opacity: 0; transform: scaleX(0); } 100% { opacity: 1; transform: scaleX(1); } }',
    '  @keyframes ck-strum { 0% { stroke-dashoffset: 100%; } 100% { stroke-dashoffset: 0%; } }',
  ]

  const totalElements = barreCount + fingerCount
  for (let i = 0; i < totalElements; i++) {
    const index = direction === 'up' ? totalElements - 1 - i : i
    const delay = index * stagger
    const cls = i < barreCount ? `ck-barre-${i}` : `ck-dot-${i - barreCount}`
    const anim = i < barreCount ? 'ck-barre-grow' : 'ck-pop'
    const origin = i < barreCount ? 'transform-origin: center center;' : 'transform-origin: center center;'
    lines.push(
      `  .${cls} { opacity: 0; ${origin} animation: ${anim} ${duration}ms ${easing} ${delay}ms ${iteration} forwards; }`,
    )
  }

  lines.push('</style>')
  return lines.join('\n')
}
