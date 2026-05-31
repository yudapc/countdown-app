import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { CountdownProvider } from './shared'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <CountdownProvider>
        <App />
      </CountdownProvider>
    </BrowserRouter>
  </StrictMode>,
)
