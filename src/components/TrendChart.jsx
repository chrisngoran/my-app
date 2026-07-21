import { useMemo, useRef, useState } from 'react'
import { compactMoney, formatMoney, localISO, niceTicks } from '../lib/utils'

const W = 640
const H = 250
const M = { top: 12, right: 12, bottom: 26, left: 48 }

function columnPath(x, top, w, h) {
  const r = Math.min(4, w / 2, h)
  return `M${x},${top + h} V${top + r} Q${x},${top} ${x + r},${top} H${x + w - r} Q${x + w},${top} ${x + w},${top + r} V${top + h} Z`
}

function buildBuckets(rows, rangeStart) {
  if (!rows.length) return []
  const now = new Date()
  const minStr = rows.reduce((a, t) => (t.date < a ? t.date : a), rows[0].date)
  const min = rangeStart ?? new Date(minStr + 'T12:00:00')
  const spanDays = (now - min) / 864e5
  const buckets = []

  if (spanDays <= 40) {
    const d = new Date(min)
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7)) // back to Monday
    while (d <= now) {
      const end = new Date(d)
      end.setDate(end.getDate() + 6)
      buckets.push({
        from: localISO(d),
        to: localISO(end),
        label: `${d.getDate()} ${d.toLocaleString('en', { month: 'short' })}`,
        income: 0,
        expense: 0,
      })
      d.setDate(d.getDate() + 7)
    }
  } else {
    const d = new Date(min.getFullYear(), min.getMonth(), 1, 12)
    while (d <= now) {
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 12)
      buckets.push({
        from: localISO(d),
        to: localISO(end),
        label: d.toLocaleString('en', { month: 'short' }),
        income: 0,
        expense: 0,
      })
      d.setMonth(d.getMonth() + 1)
    }
  }

  const bs = buckets.slice(-12)
  for (const t of rows) {
    const b = bs.find((b) => t.date >= b.from && t.date <= b.to)
    if (b) b[t.type] += t.amount
  }
  return bs
}

export default function TrendChart({ transactions, rangeStart }) {
  const wrapRef = useRef(null)
  const [tip, setTip] = useState(null)

  const buckets = useMemo(
    () => buildBuckets(transactions, rangeStart),
    [transactions, rangeStart],
  )
  const max = Math.max(0, ...buckets.map((b) => Math.max(b.income, b.expense)))

  if (!buckets.length || max === 0)
    return <p className="empty">No transactions in this range.</p>

  const ticks = niceTicks(max)
  const tickMax = ticks[ticks.length - 1]
  const plotW = W - M.left - M.right
  const plotH = H - M.top - M.bottom
  const y = (v) => M.top + plotH - (v / tickMax) * plotH
  const band = plotW / buckets.length
  const colW = Math.min(20, Math.max(6, (band - 10) / 2 - 1))
  const groupW = colW * 2 + 2
  const labelEvery = buckets.length > 8 ? 2 : 1

  const showTip = (i, e) => {
    const rect = wrapRef.current.getBoundingClientRect()
    if (e.clientX !== undefined) {
      setTip({ i, x: e.clientX - rect.left, y: e.clientY - rect.top })
    } else {
      const scale = rect.width / W
      setTip({ i, x: (M.left + i * band + band / 2) * scale, y: 40 })
    }
  }

  return (
    <div className="chart-wrap" ref={wrapRef}>
      <div className="legend">
        <span className="legend-item">
          <span className="swatch" style={{ background: 'var(--income)' }} /> Income
        </span>
        <span className="legend-item">
          <span className="swatch" style={{ background: 'var(--expense)' }} /> Expenses
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="group" aria-label="Income and expenses over time">
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={M.left}
              x2={W - M.right}
              y1={y(t)}
              y2={y(t)}
              stroke={t === 0 ? 'var(--baseline)' : 'var(--grid)'}
              strokeWidth="1"
            />
            <text x={M.left - 8} y={y(t) + 3.5} textAnchor="end" className="axis-text">
              {compactMoney(t)}
            </text>
          </g>
        ))}
        {buckets.map((b, i) => {
          const x0 = M.left + i * band + (band - groupW) / 2
          return (
            <g key={b.from} className={tip?.i === i ? 'lift' : ''}>
              {b.income > 0 && (
                <path d={columnPath(x0, y(b.income), colW, plotH - (y(b.income) - M.top))} fill="var(--income)" />
              )}
              {b.expense > 0 && (
                <path
                  d={columnPath(x0 + colW + 2, y(b.expense), colW, plotH - (y(b.expense) - M.top))}
                  fill="var(--expense)"
                />
              )}
              {i % labelEvery === 0 && (
                <text x={M.left + i * band + band / 2} y={H - 8} textAnchor="middle" className="axis-text">
                  {b.label}
                </text>
              )}
            </g>
          )
        })}
        {buckets.map((b, i) => (
          <rect
            key={b.from}
            x={M.left + i * band}
            y={M.top}
            width={band}
            height={plotH}
            fill="transparent"
            tabIndex={0}
            role="img"
            aria-label={`${b.label}: income ${formatMoney(b.income)}, expenses ${formatMoney(b.expense)}`}
            onPointerMove={(e) => showTip(i, e)}
            onPointerLeave={() => setTip(null)}
            onFocus={(e) => showTip(i, e)}
            onBlur={() => setTip(null)}
          />
        ))}
      </svg>
      {tip && (
        <div
          className="tooltip"
          style={{
            left: Math.min(tip.x + 14, (wrapRef.current?.clientWidth ?? W) - 170),
            top: Math.max(tip.y - 12, 0),
          }}
        >
          <div className="tip-head">{buckets[tip.i].label}</div>
          <div className="tip-row">
            <span className="key" style={{ background: 'var(--income)' }} />
            <span className="name">Income</span>
            <span className="val">{formatMoney(buckets[tip.i].income)}</span>
          </div>
          <div className="tip-row">
            <span className="key" style={{ background: 'var(--expense)' }} />
            <span className="name">Expenses</span>
            <span className="val">{formatMoney(buckets[tip.i].expense)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
