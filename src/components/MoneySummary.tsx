import { StatCard } from './StatCard'

const money = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

interface MoneySummaryProps {
  showPayment: number
  merchTotal: number
  softMerchUnits?: number
  hardMerchUnits?: number
  gasSpent: number
  foodSpent: number
  lodgingSpent: number
  equipmentSpent: number
  attendance?: number | null
}

export function MoneySummary({
  showPayment,
  merchTotal,
  softMerchUnits,
  hardMerchUnits,
  gasSpent,
  foodSpent,
  lodgingSpent,
  equipmentSpent,
  attendance,
}: MoneySummaryProps) {
  const net = showPayment + merchTotal - gasSpent - foodSpent - lodgingSpent - equipmentSpent

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {attendance !== undefined && <StatCard label="Attendance" value={attendance != null ? String(attendance) : '—'} />}
      <StatCard label="Show Payment" value={money(showPayment)} />
      <StatCard label="Merch" value={money(merchTotal)} />
      {softMerchUnits !== undefined && <StatCard label="Soft merch units" value={String(softMerchUnits)} />}
      {hardMerchUnits !== undefined && <StatCard label="Hard merch units" value={String(hardMerchUnits)} />}
      <StatCard label="Gas" value={money(-gasSpent)} tone={gasSpent > 0 ? 'negative' : 'neutral'} />
      <StatCard label="Food" value={money(-foodSpent)} tone={foodSpent > 0 ? 'negative' : 'neutral'} />
      <StatCard label="Lodging" value={money(-lodgingSpent)} tone={lodgingSpent > 0 ? 'negative' : 'neutral'} />
      <StatCard label="Equipment" value={money(-equipmentSpent)} tone={equipmentSpent > 0 ? 'negative' : 'neutral'} />
      <StatCard label="Net" value={money(net)} tone={net >= 0 ? 'positive' : 'negative'} />
    </div>
  )
}
