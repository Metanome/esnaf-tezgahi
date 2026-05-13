export default function SummaryCard({ label, value, icon, accent = false, danger = false, warning = false }) {
  const color = danger ? 'var(--danger)' : warning ? 'var(--warning)' : accent ? 'var(--accent)' : 'var(--text-primary)'
  const borderColor = danger ? 'var(--danger)' : warning ? 'var(--warning)' : accent ? 'var(--accent)' : null
  return (
    <div className="card" style={borderColor ? { borderColor: `color-mix(in srgb, ${borderColor} 40%, transparent)` } : {}}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-2xl font-bold" style={{ color }}>{value ?? '-'}</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</div>
        </div>
        {icon && (
          <div className="opacity-20 mt-0.5" style={{ color }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
