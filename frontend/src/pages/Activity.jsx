import { useState, useEffect, useCallback } from 'react'
import { getAgentLogs } from '../api/dashboard'
import { useSSE } from '../providers/SSEProvider'
import { useTheme } from '../providers/ThemeProvider'
import { T } from '../constants'
import SkeletonCard from '../components/SkeletonCard'
import EmptyState from '../components/EmptyState'
import { ClockIcon } from '../components/Icons'

export default function Activity() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { lastUpdate } = useSSE()
  const { lang } = useTheme()
  const t = T[lang]

  const fetchLogs = useCallback((silent = false) => {
    if (!silent) setLoading(true)
    getAgentLogs(100)
      .then(setLogs)
      .catch(e => { if (!silent) setError(e.response?.data?.detail || e.message) })
      .finally(() => { if (!silent) setLoading(false) })
  }, [])

  useEffect(() => { fetchLogs() }, [fetchLogs])
  useEffect(() => { if (lastUpdate) fetchLogs(true) }, [lastUpdate, fetchLogs])

  if (loading) return (
    <div className="space-y-3">
      <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
    </div>
  )
  if (error) return <div className="text-sm" style={{ color: 'var(--danger)' }}>{t.error}: {error}</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t.agentActivity}</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{logs.length} {t.totalOrders.replace('orders', 'entries').replace('sipariş', 'kayıt')}</p>
      </div>

      {logs.length === 0 ? (
        <EmptyState
          icon={<ClockIcon size={48} />}
          title={t.agentActivity}
          description={t.noActivity}
        />
      ) : (
        <div className="space-y-3">
          {logs.map(log => (
            <div key={log.id} className="card">
              <div className="flex items-center gap-2 mb-2">
                <span className="badge badge-source">
                  {t.sourceLabels[log.input_type] ?? log.input_type.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
                  {new Date(log.created_at).toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US')}
                </span>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{log.reasoning}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
