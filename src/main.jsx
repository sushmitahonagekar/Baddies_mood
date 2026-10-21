import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Debug helper: shows any crash on the page instead of a blank screen
window.addEventListener('error', (e) => {
  document.body.innerHTML =
    '<pre style="padding:20px;color:#b00020;white-space:pre-wrap;font-size:16px">' +
    'ERROR: ' + e.message + '\n' + (e.filename || '') + ':' + (e.lineno || '') + '</pre>'
})

createRoot(document.getElementById('root')).render(<App />)

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  addEventListener('load', () => navigator.serviceWorker.register('/sw.js'))
}
