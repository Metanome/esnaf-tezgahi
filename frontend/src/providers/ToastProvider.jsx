import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircleIcon, AlertCircleIcon, AlertTriangleIcon, XIcon } from '../components/Icons'

const ToastContext = createContext(null)

const ICONS = {
  success: <CheckCircleIcon size={16} />,
  error: <AlertCircleIcon size={16} />,
  warning: <AlertTriangleIcon size={16} />,
}

const STYLES = {
  success: 'bg-slate-800 border-teal-500/40 text-teal-300',
  error:   'bg-slate-800 border-red-500/40 text-red-300',
  warning: 'bg-slate-800 border-amber-500/40 text-amber-300',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }, [])

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 w-80 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-lg border shadow-xl
              animate-in slide-in-from-bottom-2 fade-in duration-200
              ${STYLES[t.type] ?? STYLES.success}`}
          >
            <span className="mt-0.5 shrink-0">{ICONS[t.type]}</span>
            <span className="text-sm flex-1 leading-snug text-slate-200">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 text-slate-500 hover:text-slate-300 transition-colors mt-0.5"
            >
              <XIcon size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
