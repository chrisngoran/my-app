import { useMemo, useRef, useState } from 'react'
import { compactMoney, formatMoney } from '../lib/utils'

const W = 640
const LABEL_W = 110
const VALUE_W = 74
const ROW_H = 34
const BAR_H = 16

function barPath(x, y, w, h) {
  const r = Math.min(4, h / 2, w)
  return `M${x},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h - r} Q${x + w},${y + h} ${x + w - r},${y + h} H${x} Z`
}

export default function CategoryChart({ transactions }) {
  const wrapRef = useRef(null)
  const [tip, setTip] = useState(null)

  const rows = useMemo(() => {
    const byCat = new Map()
    for (const t of transactions) {
      if (t.type !== 'expense') continue
      byCat.set(t.category, (byCat.get(t.category) ?? 0) + t.amount)
    }
    const sorted = [...byCat.entries()].sort((a, b) => b[1] - a[1])
    if (sorted.length > 7) {
      const head = sorted.slice(0, 6)
      const tail = sorted.slice(6).reduce((s, [, v]) => s + v, 0)
      return [...head, ['Other', tail]].map(([name, value]) => ({ name, value }))
    }
    return sorted.map(([name, value]) => ({ name, value }))
  }, [transactions])

  if (!rows.length) return <p className="empty">No expenses in this range.</p>

  const total = rows.reduce((s, r) => s + r.value, 0)
  const max = rows[0].value
  const H = rows.length * ROW_H + 8
  const barMaxW = W - LABEL_W - VALUE_W - 12

  const showTip = (i, e) => {
    const rect = wrapRef.current.getBoundingClientRect()
    if (e.clientX !== undefined) {
      setTip({ i, x: e.clientX - rect.left, y: e.clientY - rect.top })
    } else {
      const scale = rect.width / W
      setTip({ i, x: LABEL_W * scale, y: (i * ROW_H + ROW_H / 2) * scale })
    }
  }

  return (
    <div className="chart-wrap" ref={wrapRef}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="group" aria-label="Expenses by category">
        {rows.map((r, i) => {
          const yMid = 4 + i * ROW_H + ROW_H / 2
          const w = Math.max(2, (r.value / max) * barMaxW)
          return (
            <g key={r.name} className={tip?.i === i ? 'lift' : ''}>
              <text x={LABEL_W - 10} y={yMid + 4} textAnchor="end" className="cat-label">
                {r.name}
              </text>
              <path d={barPath(LABEL_W, yMid - BAR_H / 2, w, BAR_H)} fill="var(--expense)" />
              <text x={LABEL_W + w + 8} y={yMid + 4} className="axis-text">
                {compactMoney(r.value)}
              </text>
            </g>
          )
        })}
        {rows.map((r, i) => (
          <rect
            key={r.name}
            x={0}
            y={4 + i * ROW_H}
            width={W}
            height={ROW_H}
            fill="transparent"
            tabIndex={0}
            role="img"
            aria-label={`${r.name}: ${formatMoney(r.value)}, ${Math.round((r.value / total) * 100)}% of spending`}
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
          <div className="tip-head">{rows[tip.i].name}</div>
          <div className="tip-row">
            <span className="key" style={{ background: 'var(--expense)' }} />
            <span className="name">{Math.round((rows[tip.i].value / total) * 100)}% of spending</span>
            <span className="val">{formatMoney(rows[tip.i].value)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
