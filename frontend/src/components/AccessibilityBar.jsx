import { useState } from 'react'
import { useTheme } from '../providers/ThemeProvider'

export default function AccessibilityBar() {
  const { theme, toggleTheme, fontSize, cycleFontSize } = useTheme()
  const [open, setOpen] = useState(false)

  const fontLabel = { md: 'A', lg: 'A+', xl: 'A++' }[fontSize]

  const btnStyle = {
    width: '36px', height: '36px', borderRadius: '50%',
    background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    transition: 'all 0.15s'
  }

  return (
    <div
      style={{ position: 'fixed', bottom: '20px', left: '20px', zIndex: 9999 }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '6px' }}>
          <button onClick={toggleTheme} title={theme === 'dark' ? 'Açık tema' : 'Koyu tema'} style={btnStyle}>
            {theme === 'dark' ? '☀' : '☾'}
          </button>
          <button onClick={cycleFontSize} title="Yazı boyutu" style={{ ...btnStyle, fontSize: '13px', fontWeight: '700' }}>
            {fontLabel}
          </button>
        </div>
      )}
      <button style={{ ...btnStyle, opacity: open ? 1 : 0.6 }} title="Erişilebilirlik">
        ♿
      </button>
    </div>
  )
}
