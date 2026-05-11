import { useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import StockBadge from '../components/StockBadge'
import { useInventory } from '../hooks/useInventory'
import { useToast } from '../providers/ToastProvider'
import ConfirmDialog from '../components/ConfirmDialog'
import { EditIcon, SettingsIcon, TrashIcon, CheckIcon, XIcon, UploadIcon, PlusIcon } from '../components/Icons'

export default function Inventory() {
  const { products, loading, error, patch, create, upload, remove } = useInventory()
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const [editId, setEditId] = useState(null)
  const [editQty, setEditQty] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editThreshold, setEditThreshold] = useState('')
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('all')

  const toast = useToast()
  const [confirmDelete, setConfirmDelete] = useState(null) // { id, name }

  const [showModal, setShowModal] = useState(false)
  const [newProduct, setNewProduct] = useState({ name: '', category: '', price: '', stock: '', threshold: '10', supplierName: '', supplierEmail: '' })
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const filtered = products.filter(p => {
    const matchesStatus = filter === 'all' || p.status === filter
    const matchesQuery = q === '' || p.name.toLowerCase().includes(q.toLowerCase()) || p.sku.toLowerCase().includes(q.toLowerCase())
    return matchesStatus && matchesQuery
  })

  const handleSave = async (id) => {
    const qty = parseInt(editQty, 10)
    const price = parseFloat(editPrice)
    const threshold = parseInt(editThreshold, 10)
    if (isNaN(qty) || qty < 0 || isNaN(price) || price < 0 || isNaN(threshold) || threshold < 0) return
    setSaving(true)
    await patch(id, { 
      stock_quantity: qty, 
      category: editCategory || 'General', 
      unit_price: price,
      reorder_threshold: threshold
    })
    setSaving(false)
    setEditId(null)
  }

  if (loading) return <div className="text-slate-500 text-sm">Loading inventory...</div>
  if (error) return <div className="text-red-400 text-sm">Error: {error}</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Inventory</h1>
          <p className="text-slate-500 text-sm mt-1">
            {products.length} total products
            {q && <span className="ml-2 text-teal-400">· Filtering by "{q}"</span>}
          </p>
        </div>
        <div className="flex gap-2">
          {['all', 'critical', 'low', 'ok'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`btn-ghost capitalize ${filter === f ? 'text-teal-400 bg-teal-900/20' : ''}`}
            >
              {f}
            </button>
          ))}
          <div className="w-px h-6 bg-slate-800 mx-2 self-center"></div>
          <button onClick={() => fileInputRef.current?.click()} className="btn-ghost flex items-center gap-2" disabled={uploading}>
            <UploadIcon size={16} />
            {uploading ? 'Uploading...' : 'Import CSV'}
          </button>
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={async (e) => {
              if (e.target.files?.[0]) {
                setUploading(true)
                try {
                  const res = await upload(e.target.files[0])
                  toast(`Successfully imported ${res.added_count} products.`, 'success')
                } catch (err) {
                  toast(err.response?.data?.detail || err.message, 'error')
                }
                setUploading(false)
                e.target.value = ''
              }
            }} 
          />
          <button onClick={() => {
            setNewProduct({ name: '', category: '', price: '', stock: '', threshold: '10', supplierName: '', supplierEmail: '' })
            setShowModal(true)
          }} className="btn-primary flex items-center gap-2">
            <PlusIcon size={16} />
            Add Product
          </button>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              {['Product', 'SKU', 'Category', 'Price', 'Stock', 'Threshold', 'Status', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3 text-slate-200 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-slate-500 font-mono text-xs">{p.sku}</td>
                <td className="px-4 py-3 text-slate-400">
                  {editId === p.id ? (
                    <input
                      type="text"
                      value={editCategory}
                      onChange={e => setEditCategory(e.target.value)}
                      className="input w-24 py-1 text-sm"
                    />
                  ) : (
                    p.category
                  )}
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {editId === p.id ? (
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editPrice}
                      onChange={e => setEditPrice(e.target.value)}
                      className="input w-16 py-1 text-sm"
                    />
                  ) : (
                    `${import.meta.env.VITE_CURRENCY_SYMBOL || '$'}${p.unit_price.toFixed(2)}`
                  )}
                </td>
                <td className="px-4 py-3">
                  {editId === p.id ? (
                    <input
                      type="number"
                      min="0"
                      value={editQty}
                      onChange={e => setEditQty(e.target.value)}
                      className="input w-16 text-center py-1 text-sm"
                    />
                  ) : (
                    <span className="text-slate-200 font-semibold">{p.stock_quantity}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editId === p.id ? (
                    <input
                      type="number"
                      min="0"
                      value={editThreshold}
                      onChange={e => setEditThreshold(e.target.value)}
                      className="input w-16 text-center py-1 text-sm"
                    />
                  ) : (
                    <span className="text-slate-500">{p.reorder_threshold}</span>
                  )}
                </td>
                <td className="px-4 py-3"><StockBadge status={p.status} /></td>
                <td className="px-4 py-3 text-right">
                  {editId === p.id ? (
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => handleSave(p.id)} disabled={saving} className="p-1.5 bg-teal-900/40 text-teal-400 hover:bg-teal-900/60 rounded transition-colors" title="Save changes">
                        {saving ? '...' : <CheckIcon />}
                      </button>
                      <button onClick={() => setEditId(null)} className="p-1.5 bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors" title="Cancel">
                        <XIcon />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-1 justify-end">
                      <button
                        title="Quick Edit inline"
                        onClick={() => { 
                          setEditId(p.id); 
                          setEditQty(String(p.stock_quantity));
                          setEditCategory(p.category);
                          setEditPrice(String(p.unit_price));
                          setEditThreshold(String(p.reorder_threshold));
                        }}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                      >
                        <EditIcon />
                      </button>
                      <button
                        title="Edit Full Details"
                        onClick={() => {
                          setNewProduct({
                            id: p.id,
                            name: p.name,
                            category: p.category,
                            price: String(p.unit_price),
                            stock: String(p.stock_quantity),
                            threshold: String(p.reorder_threshold),
                            supplierName: p.supplier_name || '',
                            supplierEmail: p.supplier_email || ''
                          });
                          setShowModal(true);
                        }}
                        className="p-1.5 bg-teal-900/30 hover:bg-teal-900/50 text-teal-400 rounded transition-colors"
                      >
                        <SettingsIcon />
                      </button>
                      <button
                        title="Delete product"
                        onClick={() => setConfirmDelete({ id: p.id, name: p.name })}
                        className="p-1.5 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded transition-colors"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-100">{newProduct.id ? 'Edit Product' : 'Add New Product'}</h2>
              <p className="text-sm text-slate-500 mt-1">{newProduct.id ? 'Update product details.' : 'Enter product details to add to inventory.'}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wide">Name</label>
                <input 
                  type="text" 
                  className="input" 
                  value={newProduct.name} 
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})} 
                  placeholder="e.g. Premium Coffee"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wide">Category</label>
                  <input 
                    type="text" 
                    className="input" 
                    value={newProduct.category} 
                    onChange={e => setNewProduct({...newProduct, category: e.target.value})} 
                    placeholder="e.g. Beverages"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wide">Price</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="input" 
                    value={newProduct.price} 
                    onChange={e => setNewProduct({...newProduct, price: e.target.value})} 
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wide">Initial Stock</label>
                  <input 
                    type="number" 
                    className="input" 
                    value={newProduct.stock} 
                    onChange={e => setNewProduct({...newProduct, stock: e.target.value})} 
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wide">Threshold</label>
                  <input 
                    type="number" 
                    className="input" 
                    value={newProduct.threshold} 
                    onChange={e => setNewProduct({...newProduct, threshold: e.target.value})} 
                    placeholder="10"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wide">Supplier Name</label>
                  <input 
                    type="text" 
                    className="input" 
                    value={newProduct.supplierName} 
                    onChange={e => setNewProduct({...newProduct, supplierName: e.target.value})} 
                    placeholder="e.g. Anadolu Tarım"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wide">Supplier Email</label>
                  <input 
                    type="email" 
                    className="input" 
                    value={newProduct.supplierEmail} 
                    onChange={e => setNewProduct({...newProduct, supplierEmail: e.target.value})} 
                    placeholder="contact@anadolu.com"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2 border-t border-slate-800">
              <button 
                onClick={() => setShowModal(false)} 
                className="btn-ghost"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  if (!newProduct.name) return toast('Name is required', 'warning')
                  setSaving(true)
                  try {
                    const payload = {
                      name: newProduct.name,
                      category: newProduct.category || 'General',
                      unit_price: parseFloat(newProduct.price || 0),
                      stock_quantity: parseInt(newProduct.stock || 0, 10),
                      reorder_threshold: parseInt(newProduct.threshold || 10, 10),
                      supplier_name: newProduct.supplierName || '',
                      supplier_email: newProduct.supplierEmail || ''
                    };
                    
                    if (newProduct.id) {
                      await patch(newProduct.id, payload)
                      toast('Product updated.', 'success')
                    } else {
                      await create(payload)
                      toast('Product added to inventory.', 'success')
                    }
                    setShowModal(false)
                    setNewProduct({ name: '', category: '', price: '', stock: '', threshold: '10', supplierName: '', supplierEmail: '' })
                  } catch (e) {
                    toast(e.response?.data?.detail || 'Error saving product', 'error')
                  }
                  setSaving(false)
                }}
                disabled={saving || !newProduct.name}
                className="btn-primary"
              >
                {saving ? 'Saving...' : (newProduct.id ? 'Save Changes' : 'Add Product')}
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${confirmDelete?.name}"? This cannot be undone.`}
        danger
        onCancel={() => setConfirmDelete(null)}
        onConfirm={async () => {
          await remove(confirmDelete.id)
          toast(`"${confirmDelete.name}" deleted.`, 'warning')
          setConfirmDelete(null)
        }}
      />
    </div>
  )
}
