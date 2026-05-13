import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { ROUTES, T } from '../constants'
import { useAlerts } from '../hooks/useAlerts'
import { useTheme } from '../providers/ThemeProvider'
import { BellIcon, GlobeIcon, MenuIcon, MoonIcon, PlusIcon, SearchIcon, SunIcon, XIcon } from './Icons'
import UserMenu from './UserMenu'

export default function Header({ onMenuClick }) {
  const { alerts, resolve } = useAlerts()
  const { lang, theme, toggleTheme, toggleLang } = useTheme()
  const t = T[lang]
  const [showDropdown, setShowDropdown] = useState(false)
  const [mobileSearch, setMobileSearch] = useState(false)
  const dropdownRef = useRef(null)
  const mobileInputRef = useRef(null)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')

  const relTime = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return t.timeJustNow
    if (mins < 60) return t.timeMinutesAgo.replace('{n}', mins)
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return t.timeHoursAgo.replace('{n}', hrs)
    return t.timeDaysAgo.replace('{n}', Math.floor(hrs / 24))
  }

  const now = new Date()
  const todayDay = now.toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', { weekday: 'long' })
  const todayDate = now.toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '')
  }, [searchParams])

  useEffect(() => {
    if (mobileSearch) mobileInputRef.current?.focus()
  }, [mobileSearch])

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      if (searchQuery.trim()) {
        navigate(`${ROUTES.INVENTORY}?q=${encodeURIComponent(searchQuery.trim())}`)
      } else {
        navigate(ROUTES.INVENTORY)
      }
      setMobileSearch(false)
    }
  }

  return (
    <header style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}
      className="h-16 backdrop-blur-sm sticky top-0 z-40 flex items-center justify-between px-4 sm:px-8 relative overflow-visible">

      {mobileSearch && (
        <div className="absolute inset-0 flex items-center gap-2 px-4 z-50"
          style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}>
          <input
            ref={mobileInputRef}
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="flex-1 rounded-full px-4 py-1.5 text-sm focus:outline-none"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
          />
          <button onClick={() => setMobileSearch(false)} style={{ color: 'var(--text-muted)' }}>
            <XIcon size={18} />
          </button>
        </div>
      )}
      <div className="flex items-center flex-1 max-w-md">
        <button onClick={onMenuClick} className="md:hidden mr-3 shrink-0" style={{ color: 'var(--text-secondary)' }}>
          <MenuIcon size={24} />
        </button>
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
          className="hidden sm:block w-full rounded-full px-4 py-1.5 text-sm focus:outline-none transition-colors"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
        />
      </div>

      <div className="flex items-center gap-3">
        <button className="sm:hidden" onClick={() => setMobileSearch(true)}
          style={{ color: 'var(--text-secondary)' }}>
          <SearchIcon size={20} />
        </button>

        <div className="hidden sm:flex flex-col items-end">
          <span className="text-xs font-semibold capitalize" style={{ color: 'var(--accent)' }}>{todayDay}</span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{todayDate}</span>
        </div>

        <Link to={ROUTES.UPLOAD} className="btn-primary flex items-center gap-2 py-1.5 px-4 text-sm hidden sm:flex">
          <PlusIcon size={16} />
          {t.newOrder}
        </Link>

        <button onClick={toggleTheme} title={t.appearance}
          className="p-1.5 rounded-lg transition-colors hidden sm:flex items-center justify-center"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
          {theme === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
        </button>

        <button onClick={toggleLang} title={t.language}
          className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-colors"
          style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-color)' }}>
          <GlobeIcon size={13} />{lang.toUpperCase()}
        </button>

        <div className="relative" ref={dropdownRef}>
          <div className="cursor-pointer relative transition-colors" style={{ color: 'var(--text-secondary)' }}
            onClick={() => setShowDropdown(!showDropdown)}>
            <BellIcon size={20} />
            {alerts.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {alerts.length}
              </span>
            )}
          </div>

          {showDropdown && (
            <div className="absolute right-0 mt-4 w-64 rounded-lg shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
              <div className="px-4 py-2 mb-2 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t.notifications}</div>
                {alerts.length > 0 && (
                  <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-red-500 text-white">{alerts.length}</span>
                )}
              </div>
              {alerts.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>{t.noAlerts}</div>
              ) : (
                <div className="max-h-72 overflow-y-auto">
                  {alerts.slice(0, 5).map(alert => {
                    const dotColor = alert.type === 'critical_stock' ? 'bg-red-500' : alert.type === 'low_stock' ? 'bg-amber-400' : 'bg-blue-400'
                    return (
                      <div key={alert.id} className="group px-4 py-3 flex gap-2.5 cursor-pointer transition-colors hover:opacity-80"
                        style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}
                        onClick={() => { setShowDropdown(false); navigate(ROUTES.ALERTS) }}>
                        <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                            {alert.product_name || t.alertTypeLabels[alert.type] || alert.type}
                          </p>
                          <p className="text-xs leading-snug mt-0.5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                            {alert.message}
                          </p>
                          {alert.created_at && (
                            <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{relTime(alert.created_at)}</p>
                          )}
                        </div>
                        <button
                          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded"
                          style={{ color: 'var(--text-muted)' }}
                          onClick={e => { e.stopPropagation(); resolve(alert.id) }}>
                          <XIcon size={12} />
                        </button>
                      </div>
                    )
                  })}
                  {alerts.length > 5 && (
                    <div className="px-4 py-2 text-center" style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>+{alerts.length - 5} {t.more}</span>
                    </div>
                  )}
                  <div className="p-2">
                    <Link to={ROUTES.ALERTS}
                      className="block w-full text-center py-1.5 rounded text-sm transition-colors"
                      style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
                      onClick={() => setShowDropdown(false)}>
                      {t.viewAll}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="pl-4" style={{ borderLeft: '1px solid var(--border-color)' }}>
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
