export function parseCssDuration(value: string): number {
  const match = value.trim().match(/^(\d*\.?\d+)(ms|s)$/)
  if (!match) return 0
  return Number(match[1]) * (match[2] === "s" ? 1000 : 1)
}
