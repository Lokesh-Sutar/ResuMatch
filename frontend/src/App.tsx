import { useEffect } from 'react'
import AOS from 'aos'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { NavBar } from './components/layout/NavBar'
import { HomePage } from './pages/HomePage'
import { AnalyzePage } from './pages/AnalyzePage'
import { ResultsPage } from './pages/ResultsPage'

export default function App() {
  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,
      offset: 16,
    })
  }, [])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 bg-mesh text-slate-800 selection:bg-brand-500/30">
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/analyze" element={<AnalyzePage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
