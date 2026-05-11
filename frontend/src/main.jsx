import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SSEProvider } from './providers/SSEProvider.jsx'
import { ToastProvider } from './providers/ToastProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SSEProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </SSEProvider>
  </StrictMode>,
)
