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
  const balanceDiff = previous ? balance - (previous.income - previous.expense) : null

  const tiles = [
    {
      key: 'income',
      label: 'Income',
      value: current.income,
      diff: previous ? current.income - previous.income : null,
      upIsGood: true,
    },
    {
      key: 'expense',
      label: 'Expenses',
      value: current.expense,
      diff: previous ? current.expense - previous.expense : null,
      upIsGood: false,
    },
  ]

  return (
    <>
      <div className="hero-balance">
        <div className="tile-label">Balance</div>
        <div className="hero-value" title={formatMoney(balance)}>
          {balance < 0 ? '−' : ''}
          {compactMoney(Math.abs(balance))} <span className="tile-unit">FCFA</span>
        </div>
        <Delta diff={balanceDiff} upIsGood={true} />
      </div>
      <div className="tiles">
        {tiles.map((t) => (
          <div key={t.key} className={`card tile ${t.key}`}>
            <div className="tile-label">{t.label}</div>
            <div className="tile-value" title={formatMoney(t.value)}>
              {t.value < 0 ? '−' : ''}
              {compactMoney(Math.abs(t.value))} <span className="tile-unit">FCFA</span>
            </div>
            <Delta diff={t.diff} upIsGood={t.upIsGood} />
          </div>
        ))}
      </div>
    </>
  )
}
