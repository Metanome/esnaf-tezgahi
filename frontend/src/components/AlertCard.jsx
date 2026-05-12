import { useState } from 'react'
import { ALERT_TYPE_LABELS } from '../constants'
import { useTheme } from '../providers/ThemeProvider'
import { MailIcon, XIcon, CheckCircleIcon } from './Icons'

export default function AlertCard({ alert, onResolve }) {
  const [showEmail, setShowEmail] = useState(false)
  const [resolving, setResolving] = useState(false)
  const { lang } = useTheme()
  const isCritical = alert.type === 'critical_stock'

  const handleResolve = async () => {
    setResolving(true)
    await onResolve(alert.id)
  }

  return (
    <div className={`card border-l-4 ${isCritical ? 'border-l-red-500' : 'border-l-amber-500'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`badge ${isCritical ? 'badge-critical' : 'badge-low'}`}>
              {ALERT_TYPE_LABELS[alert.type]}
            </span>
            {alert.product_name && (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{alert.product_name}</span>
            )}
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{alert.message}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {new Date(alert.created_at).toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US')}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {alert.draft_email && (
            <button className="btn-ghost flex items-center gap-1.5" style={{ color: 'var(--accent)' }}
              onClick={() => setShowEmail(v => !v)}>
              <MailIcon size={14} />
              {showEmail ? (lang === 'tr' ? 'Gizle' : 'Hide') : (lang === 'tr' ? 'E-posta' : 'Email')}
            </button>
          )}
          <button className="btn-ghost disabled:opacity-40 flex items-center gap-1.5"
            style={{ color: '#4ade80' }}
            onClick={handleResolve} disabled={resolving}>
            {resolving ? '...' : <><CheckCircleIcon size={14} /> {lang === 'tr' ? 'Kapat' : 'Dismiss'}</>}
          </button>
        </div>
      </div>
      {showEmail && alert.draft_email && (
        <div className="mt-3 p-3 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
          <div className="text-xs font-semibold mb-2" style={{ color: 'var(--accent)' }}>
            {lang === 'tr' ? 'Tedarikçi E-posta Taslağı' : 'Draft Supplier Email'}
          </div>
          <pre className="text-xs whitespace-pre-wrap font-sans" style={{ color: 'var(--text-secondary)' }}>{alert.draft_email}</pre>
        </div>
      )}
    </div>
  )
}
