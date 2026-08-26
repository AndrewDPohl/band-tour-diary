interface StatCardProps {
  label: string
  value: string
  tone?: 'neutral' | 'positive' | 'negative'
}

const toneClasses: Record<NonNullable<StatCardProps['tone']>, string> = {
  neutral: 'text-ink',
  positive: 'text-emerald-700',
  negative: 'text-rose-700',
}

export function StatCard({ label, value, tone = 'neutral' }: StatCardProps) {
  return (
    <div className="rounded-lg border border-ink/10 bg-white/60 px-3 py-2 sm:px-4 sm:py-3">
      <div className="text-[11px] uppercase tracking-wide text-ink/50">{label}</div>
      <div className={`mt-0.5 text-lg font-semibold sm:text-xl ${toneClasses[tone]}`}>{value}</div>
    </div>
  )
}
