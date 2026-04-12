import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import App from './App.tsx'
import { ThemeProvider } from './components/ThemeContext'
import { AccessibilityProvider } from './contexts/AccessibilityContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AccessibilityProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AccessibilityProvider>
  </StrictMode>,
)
