import { StatCard } from './StatCard'

const money = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

interface MoneySummaryProps {
  doorTotal: number
  merchTotal: number
  gasSpent: number
  foodSpent: number
  attendance?: number | null
}

export function MoneySummary({ doorTotal, merchTotal, gasSpent, foodSpent, attendance }: MoneySummaryProps) {
  const net = doorTotal + merchTotal - gasSpent - foodSpent

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {attendance !== undefined && <StatCard label="Attendance" value={attendance != null ? String(attendance) : '—'} />}
      <StatCard label="Door" value={money(doorTotal)} />
      <StatCard label="Merch" value={money(merchTotal)} />
      <StatCard label="Gas" value={money(-gasSpent)} tone={gasSpent > 0 ? 'negative' : 'neutral'} />
      <StatCard label="Food" value={money(-foodSpent)} tone={foodSpent > 0 ? 'negative' : 'neutral'} />
      <StatCard label="Net" value={money(net)} tone={net >= 0 ? 'positive' : 'negative'} />
    </div>
  )
}
