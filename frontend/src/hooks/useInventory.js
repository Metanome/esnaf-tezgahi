import { useState, useEffect, useCallback } from 'react'
import { getInventory, updateStock, createProduct, uploadCSV, deleteProduct } from '../api/inventory'
import { useSSE } from '../providers/SSEProvider'

export function useInventory() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { lastUpdate } = useSSE()

  const refresh = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    setError(null)
    try {
      setProducts(await getInventory())
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

  const patch = useCallback(async (id, data) => {
    const updated = await updateStock(id, data)
    setProducts(prev => prev.map(p => p.id === id ? updated : p))
    return updated
  }, [])

  const create = useCallback(async (data) => {
    const newProd = await createProduct(data)
    setProducts(prev => [...prev, newProd].sort((a, b) => a.name.localeCompare(b.name)))
    return newProd
  }, [])

  const upload = useCallback(async (file) => {
    const res = await uploadCSV(file)
    await refresh()
    return res
  }, [refresh])

  const remove = useCallback(async (id) => {
    await deleteProduct(id)
    setProducts(prev => prev.filter(p => p.id !== id))
  }, [])

  return { products, loading, error, refresh, patch, create, upload, remove }
}
