import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnalyzeForm } from '../components/analyze/AnalyzeForm'
import { analyzeResume } from '../services/api'

export function AnalyzePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const state = location.state as { error?: string } | null
    if (state?.error) {
      setError(state.error)
    }
  }, [location.state])

  const handleAnalyze = async (file: File, jobDescription: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await analyzeResume(file, jobDescription)
      navigate('/results', { state: { result: data } })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected error occurred during analysis.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-7xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-xl rounded-2xl border border-slate-200/70 bg-white/80 p-8 text-center shadow-glow backdrop-blur-xl">
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-brand-300 border-t-brand-600" />
          <h2 className="mt-5 text-xl font-bold text-slate-900">Analyzing your resume</h2>
          <p className="mt-2 text-sm text-slate-600">Please wait while we process your resume and job description...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl items-start px-4 pt-36 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-4" data-aos="fade-up">
        <section>
          <AnalyzeForm isLoading={isLoading} onAnalyze={handleAnalyze} />
        </section>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <strong className="font-semibold">Analysis failed:</strong> {error}
          </div>
        )}
      </div>
    </main>
  )
}
