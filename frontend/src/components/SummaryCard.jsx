export default function SummaryCard({ label, value, accent = false }) {
  return (
    <div className="card" style={accent ? { borderColor: 'color-mix(in srgb, var(--accent) 40%, transparent)' } : {}}>
      <div>
        <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value ?? '-'}</div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</div>
      </div>
    </div>
  )
}
