import AlertCard from '../components/AlertCard'
import SkeletonCard from '../components/SkeletonCard'
import EmptyState from '../components/EmptyState'
import { useAlerts } from '../hooks/useAlerts'
import { useTheme } from '../providers/ThemeProvider'
import { T } from '../constants'
import { BellIcon } from '../components/Icons'

export default function Alerts() {
  const { alerts, loading, error, resolve } = useAlerts(false)
  const { lang } = useTheme()
  const t = T[lang]

  if (loading) return (
    <div className="space-y-3">
      <SkeletonCard /><SkeletonCard /><SkeletonCard />
    </div>
  )
  if (error) return <div className="text-sm" style={{ color: 'var(--danger)' }}>{t.error}: {error}</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t.activeAlerts}</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          {alerts.length > 0 ? `${alerts.length} ${t.activeAlertCount}` : t.noAlerts}
        </p>
      </div>

      {alerts.length === 0 ? (
        <EmptyState
          icon={<BellIcon size={48} />}
          title={t.allClear}
          description={t.noAlerts}
        />
      ) : (
        <div className="space-y-3">
          {alerts.map(a => (
            <AlertCard key={a.id} alert={a} onResolve={resolve} />
          ))}
        </div>
      )}
    </div>
  )
}
