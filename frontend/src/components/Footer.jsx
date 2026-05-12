import { APP_NAME } from '../constants'

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}
      className="px-4 sm:px-8 py-4">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
          <span className="font-semibold" style={{ color: 'var(--accent)' }}>{APP_NAME}</span>
          <span>·</span>
          <span>YZTA 5.0 Hackathon</span>
          <span>·</span>
          <span>{new Date().getFullYear()}</span>
        </div>
        <a href="/docs" target="_blank" rel="noopener noreferrer"
          className="font-medium transition-colors" style={{ color: 'var(--accent)' }}>
          API Reference →
        </a>
      </div>
    </footer>
  )
}
