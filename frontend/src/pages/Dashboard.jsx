import SummaryCard from '../components/SummaryCard'
import SkeletonCard from '../components/SkeletonCard'
import { useDashboard } from '../hooks/useDashboard'
import { useProfile } from '../providers/ProfileProvider'
import { useAlerts } from '../hooks/useAlerts'
import { useTheme } from '../providers/ThemeProvider'
import { T, ROUTES } from '../constants'
import { ShoppingCartIcon, BellIcon, PackageIcon, CheckCircleIcon } from '../components/Icons'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { summary, loading, error, refresh } = useDashboard()
  const { alerts, resolve } = useAlerts(false)
  const { lang } = useTheme()
  const { profile } = useProfile()
  const t = T[lang]
  const currency = import.meta.env.VITE_CURRENCY_SYMBOL || '₺'

  const handleResolve = async (id) => {
    await resolve(id)
    refresh()
  }

  if (loading) return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
      </div>
      <SkeletonCard lines={3} />
      <div className="space-y-3"><SkeletonCard /><SkeletonCard /></div>
    </div>
  )
  if (error) return <div className="text-sm" style={{ color: 'var(--danger)' }}>{t.error}: {error}</div>

  const stockCounts = summary?.stock_counts ?? { ok: 0, low: 0, critical: 0 }
  const totalProducts = summary?.total_products ?? 0
  const criticalAndLow = (stockCounts.critical ?? 0) + (stockCounts.low ?? 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {t.dashboard}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          {profile.store_name || t.dashboardSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryCard
          label={t.ordersToday}
          value={summary?.orders_today ?? 0}
          icon={<ShoppingCartIcon size={28} />}
          accent
        />
        <SummaryCard
          label={t.totalRevenue}
          value={`${currency}${(summary?.total_revenue ?? 0).toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          icon={<PackageIcon size={28} />}
        />
        <SummaryCard
          label={t.activeAlerts}
          value={alerts.length}
          icon={<BellIcon size={28} />}
          warning={alerts.length > 0}
        />
        <SummaryCard
          label={t.totalProducts}
          value={totalProducts}
          icon={<PackageIcon size={28} />}
          danger={criticalAndLow > 0 && criticalAndLow === totalProducts}
        />
      </div>

      {totalProducts > 0 && (
        <section>
          <h2 className="section-title">{t.inventoryHealth}</h2>
          <div className="card space-y-4">
            <div className="flex gap-2 h-3 rounded-full overflow-hidden">
              {stockCounts.ok > 0 && (
                <div style={{ flex: stockCounts.ok, background: 'var(--success)' }} />
              )}
              {stockCounts.low > 0 && (
                <div style={{ flex: stockCounts.low, background: 'var(--warning)' }} />
              )}
              {stockCounts.critical > 0 && (
                <div style={{ flex: stockCounts.critical, background: 'var(--danger)' }} />
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: 'var(--success)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>{t.stockStatusLabels.ok}</span>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{stockCounts.ok}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: 'var(--warning)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>{t.stockStatusLabels.low}</span>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{stockCounts.low}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: 'var(--danger)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>{t.stockStatusLabels.critical}</span>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{stockCounts.critical}</span>
              </span>
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title mb-0">{t.activeAlerts}</h2>
          <Link to={ROUTES.ALERTS} className="text-xs font-medium" style={{ color: 'var(--accent)' }}>{t.viewAll}</Link>
        </div>
        {alerts.length === 0 ? (
          <div className="card text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>{t.noAlerts}</div>
        ) : (
          <div className="card divide-y" style={{ '--tw-divide-opacity': 1 }}>
            {alerts.slice(0, 5).map(a => (
              <div key={a.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <span className={`badge shrink-0 ${a.type === 'critical_stock' ? 'badge-critical' : 'badge-low'}`}>
                  {t.alertTypeLabels[a.type]}
                </span>
                <span className="text-sm flex-1 truncate" style={{ color: 'var(--text-secondary)' }}>
                  {a.product_name && <strong style={{ color: 'var(--text-primary)' }}>{a.product_name}</strong>}
                  {a.product_name && ' — '}{a.message}
                </span>
                <button
                  onClick={() => handleResolve(a.id)}
                  className="btn-ghost shrink-0 flex items-center gap-1 text-xs py-0.5 px-1.5"
                  style={{ color: 'var(--success)' }}
                >
                  <CheckCircleIcon size={13} /> {t.dismiss}
                </button>
              </div>
            ))}
            {alerts.length > 5 && (
              <div className="pt-2.5 text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                <Link to={ROUTES.ALERTS} style={{ color: 'var(--accent)' }}>+{alerts.length - 5} {t.more} →</Link>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
