import { useState, useEffect, useCallback } from 'react'
import { getAlerts, resolveAlert } from '../api/alerts'
import { useSSE } from '../providers/SSEProvider'

export function useAlerts(all = false) {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { lastUpdate } = useSSE()

  const refresh = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    setError(null)
    try {
      setAlerts(await getAlerts(all))
    } catch (e) {
      if (!silent) setError(e.response?.data?.detail || e.message)
    } finally {
      if (!silent) setLoading(false)
    }
  }, [all])

  useEffect(() => { 
    refresh() 
  }, [refresh])

  useEffect(() => {
    if (lastUpdate) refresh(true)
  }, [lastUpdate, refresh])

  const resolve = useCallback(async (id) => {
    await resolveAlert(id)
    setAlerts(prev => prev.filter(a => a.id !== id))
  }, [])

  return { alerts, loading, error, refresh, resolve }
}
