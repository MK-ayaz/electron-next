import React from 'react'
import { createRoot } from 'react-dom/client'
import '../styles/globals.css'
import TitleBar from '../components/TitleBar.jsx'

function AppContainer() {
  return (
    <>
      <TitleBar />
      <div style={{ height: 'calc(100vh - 32px)' }}>
        <div style={{ padding: 16 }}>
          <h1>Welcome to Vite + Electron + React</h1>
          <p>Your existing components are preserved.</p>
        </div>
      </div>
    </>
  )
}

const root = createRoot(document.getElementById('root'))
root.render(<AppContainer />) 