import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './context/auth/AuthContext'
import { ThemeProvider } from './hooks/useTheme'
import { PreferencesProvider } from './hooks/usePreferences'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <PreferencesProvider>
        <AuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthProvider>
      </PreferencesProvider>
    </ThemeProvider>
  </React.StrictMode>,
)