import { useState, useEffect, useCallback } from 'react'
import { getDashboardSummary, getAgentLogs } from '../api/dashboard'
import { useSSE } from '../providers/SSEProvider'

export function useDashboard() {
  const [summary, setSummary] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { lastUpdate } = useSSE()

  const refresh = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    setError(null)
    try {
      const [s, l] = await Promise.all([
        getDashboardSummary(),
        getAgentLogs(5),
      ])
      setSummary(s)
      setLogs(l)
    } catch (e) {
      if (!silent) setError(e.response?.data?.detail || e.message)
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => { 
    refresh()
  }, [refresh])

  useEffect(() => {
    if (lastUpdate) refresh(true)
  }, [lastUpdate, refresh])

  return { summary, logs, loading, error, refresh }
}
