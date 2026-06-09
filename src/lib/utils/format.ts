/** Format number as compact currency: $387K, $1.2M */
export function fK(n: number): string {
  const sign = n < 0 ? '-' : ''
  const abs  = Math.abs(n)
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000)     return `${sign}$${Math.round(abs / 1_000)}K`
  return `${sign}$${Math.round(abs)}`
}

/** Format as signed percentage: +12.3% or -4.5% */
export function fP(n: number): string {
  return `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`
}

/** Format as plain percentage: 34.2% */
export function fX(n: number): string {
  return `${n.toFixed(1)}%`
}

/** Tailwind color class based on value (green = good, red = bad) */
export function clrClass(v: number, inverted = false): string {
  if (v >= 0) return inverted ? 'text-c-red' : 'text-c-grn'
  return inverted ? 'text-c-grn' : 'text-c-red'
}

/** Hex color based on value */
export function clrHex(v: number, inverted = false): string {
  if (v >= 0) return inverted ? '#FF4060' : '#00DFA0'
  return inverted ? '#00DFA0' : '#FF4060'
}
