import { compactMoney, formatMoney } from '../lib/utils'

function Delta({ diff, upIsGood }) {
  if (diff === null) return null
  const up = diff >= 0
  const good = up === upIsGood
  return (
    <div className={`tile-delta ${good ? 'good' : 'bad'}`}>
      {up ? '▲' : '▼'} {compactMoney(Math.abs(diff))} FCFA vs previous period
    </div>
  )
}

export default function StatTiles({ current, previous }) {
  const balance = current.income - current.expense
  const tiles = [
    {
      label: 'Balance',
      value: balance,
      hero: true,
      diff: previous ? balance - (previous.income - previous.expense) : null,
      upIsGood: true,
    },
    {
      label: 'Income',
      value: current.income,
      diff: previous ? current.income - previous.income : null,
      upIsGood: true,
    },
    {
      label: 'Expenses',
      value: current.expense,
      diff: previous ? current.expense - previous.expense : null,
      upIsGood: false,
    },
  ]
  return (
    <div className="tiles">
      {tiles.map((t) => (
        <div key={t.label} className={`card tile${t.hero ? ' hero' : ''}`}>
          <div className="tile-label">{t.label}</div>
          <div className="tile-value" title={formatMoney(t.value)}>
            {t.value < 0 ? '−' : ''}
            {compactMoney(Math.abs(t.value))} <span className="tile-unit">FCFA</span>
          </div>
          <Delta diff={t.diff} upIsGood={t.upIsGood} />
        </div>
      ))}
    </div>
  )
}
