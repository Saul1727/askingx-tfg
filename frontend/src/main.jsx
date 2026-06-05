import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { ConfigProvider } from './context/ConfigContext.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <ConfigProvider>
          <App />
        </ConfigProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
)
