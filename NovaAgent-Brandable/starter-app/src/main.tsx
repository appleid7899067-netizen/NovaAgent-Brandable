import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles.css'
import Dashboard from './pages/Dashboard'

function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard/>} />
      </Routes>
    </BrowserRouter>
  )
}

const root = document.getElementById('root') as HTMLElement
createRoot(root).render(<App />)
