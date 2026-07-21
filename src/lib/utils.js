export function localISO(d) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function formatMoney(n) {
  return `${Math.round(n).toLocaleString('en-US')} FCFA`
}

export function compactMoney(n) {
  const abs = Math.abs(n)
  if (abs >= 1e9) return `${(n / 1e9).toFixed(1)}B`
  if (abs >= 1e6) return `${(n / 1e6).toFixed(1)}M`
  if (abs >= 1e3) return `${(n / 1e3).toFixed(abs >= 1e5 ? 0 : 1)}k`
  return `${Math.round(n)}`
}

export function niceTicks(max, count = 4) {
  if (max <= 0) return [0, 1]
  const rough = max / count
  const pow = 10 ** Math.floor(Math.log10(rough))
  const step =
    [1, 2, 2.5, 5, 10].map((f) => f * pow).find((s) => max / s <= count) ||
    10 * pow
  const n = Math.ceil(max / step)
  return Array.from({ length: n + 1 }, (_, i) => i * step)
}
