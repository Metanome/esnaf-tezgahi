import { useState } from 'react'
import { useSettings } from '../hooks/useSettings'
import { resetDatabase } from '../api/settings'
import { useToast } from '../providers/ToastProvider'
import { useTheme } from '../providers/ThemeProvider'
import { T } from '../constants'
import ConfirmDialog from '../components/ConfirmDialog'
import { EyeIcon, EyeOffIcon, SaveIcon, RotateCcwIcon } from '../components/Icons'

export default function Settings() {
  const { settings, loading, saving, error, save } = useSettings()
  const { lang } = useTheme()
  const t = T[lang]
  const toast = useToast()
  const [model, setModel] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const handleSave = async () => {
    const payload = {}
    if (model && model !== settings?.default_model) payload.default_model = model
    if (apiKey.trim()) payload.gemini_api_key = apiKey.trim()
    if (!Object.keys(payload).length) return
    try {
      await save(payload)
      setApiKey('')
      setSaved(true)
      toast('Ayarlar kaydedildi.', 'success')
      setTimeout(() => setSaved(false), 3000)
    } catch (_) {
      toast('Ayarlar kaydedilemedi.', 'error')
    }
  }

  if (loading) return <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Yükleniyor...</div>

  const currentModel = model || settings?.default_model || ''

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t.settings}</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          {lang === 'tr' ? 'AI modelini ve API kimlik bilgilerini yapılandır.' : 'Configure your AI model and API credentials.'}
        </p>
      </div>

      <div className="card space-y-5">
        <div>
          <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Gemini Model
          </label>
          <select className="select" value={currentModel} onChange={e => setModel(e.target.value)}>
            {(settings?.available_models ?? []).map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Gemini API Key
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              className="input pr-16"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder={settings?.api_key_set ? '••••••••••••••••••• (key is set)' : 'API anahtarınızı girin'}
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onClick={() => setShowKey(v => !v)} type="button">
              {showKey ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
            </button>
          </div>
          <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
            {lang === 'tr' ? 'API anahtarı .env dosyanızda saklanır, tarayıcıya gönderilmez.' : 'API key is stored in your .env file and never sent to the browser.'}
          </p>
        </div>

        {error && <p className="text-sm" style={{ color: '#f87171' }}>Hata: {error}</p>}

        <button className="btn-primary w-full flex items-center justify-center gap-2" onClick={handleSave} disabled={saving}>
          {saving
            ? <><RotateCcwIcon size={15} className="animate-spin" /> {lang === 'tr' ? 'Kaydediliyor...' : 'Saving...'}</>
            : saved
            ? <><SaveIcon size={15} /> {lang === 'tr' ? 'Kaydedildi!' : 'Saved!'}</>
            : <><SaveIcon size={15} /> {lang === 'tr' ? 'Ayarları Kaydet' : 'Save Settings'}</>}
        </button>
      </div>

      <div className="card text-xs space-y-1" style={{ color: 'var(--text-muted)' }}>
        <div>{lang === 'tr' ? 'Mevcut model:' : 'Current model:'} <span style={{ color: 'var(--text-secondary)' }}>{settings?.default_model}</span></div>
        <div>API key: <span style={{ color: 'var(--text-secondary)' }}>{settings?.api_key_set ? (lang === 'tr' ? 'Ayarlandı' : 'Set') : (lang === 'tr' ? 'Ayarlanmadı' : 'Not set')}</span></div>
      </div>

      <div className="mt-8 pt-8" style={{ borderTop: '1px solid var(--border-color)' }}>
        <h2 className="text-xl font-bold mb-2" style={{ color: '#f87171' }}>
          {lang === 'tr' ? 'Tehlikeli Bölge' : 'Danger Zone'}
        </h2>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          {lang === 'tr'
            ? 'Tüm veritabanı tablolarını kalıcı olarak siler ve varsayılan verilerle yeniden doldurur.'
            : 'Irreversibly drop all database tables and reseed with default data.'}
        </p>
        <button
          className="btn-ghost flex items-center gap-2 py-2 px-4 transition-colors"
          style={{ color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}
          disabled={resetting}
          onClick={() => setConfirmReset(true)}
        >
          <RotateCcwIcon size={15} />
          {resetting
            ? (lang === 'tr' ? 'Sıfırlanıyor...' : 'Resetting...')
            : (lang === 'tr' ? 'Veritabanını Sıfırla ve Yeniden Doldur' : 'Reset Database & Reseed')}
        </button>

        <ConfirmDialog
          open={confirmReset}
          title={lang === 'tr' ? 'Veritabanı Sıfırlansın mı?' : 'Reset Database?'}
          message={lang === 'tr'
            ? 'Tüm siparişler, stok ve uyarılar kalıcı olarak silinecek ve varsayılan verilerle yeniden doldurulacak. Bu işlem geri alınamaz.'
            : 'This will permanently delete all orders, inventory, and alerts, then reseed with default data. This cannot be undone.'}
          danger
          onCancel={() => setConfirmReset(false)}
          onConfirm={async () => {
            setConfirmReset(false)
            setResetting(true)
            try {
              await resetDatabase()
              window.location.reload()
            } catch (e) {
              toast('Sıfırlama başarısız: ' + (e.response?.data?.detail || e.message), 'error')
              setResetting(false)
            }
          }}
        />
      </div>
    </div>
  )
}
