import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { analyzeResume } from '../services/api'

interface LoadingLocationState {
  file?: File
  jobDescription?: string
}

export function LoadingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LoadingLocationState | null
  const [error, setError] = useState<string | null>(null)
  const [messageIndex, setMessageIndex] = useState(0)

  const messages = useMemo(
    () => ['Parsing resume PDF...', 'Extracting and matching skills...', 'Generating recommendations...'],
    [],
  )

  useEffect(() => {
    const timer = window.setInterval(() => {
      setMessageIndex((previous) => (previous + 1) % messages.length)
    }, 1300)

    return () => window.clearInterval(timer)
  }, [messages.length])

  useEffect(() => {
    const file = state?.file
    const jobDescription = state?.jobDescription

    if (!file || !jobDescription) {
      navigate('/analyze', { replace: true })
      return
    }

    let isMounted = true

    const runAnalysis = async () => {
      try {
        const result = await analyzeResume(file, jobDescription)
        if (isMounted) {
          navigate('/results', { replace: true, state: { result } })
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Analysis failed unexpectedly.'
        if (isMounted) {
          setError(message)
        }
      }
    }

    void runAnalysis()

    return () => {
      isMounted = false
    }
  }, [navigate, state])

  if (error) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-7xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-xl rounded-2xl border border-red-200 bg-red-50 p-6 text-center shadow-glow">
          <h2 className="text-xl font-bold text-red-700">Analysis failed</h2>
          <p className="mt-2 text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => navigate('/analyze', { replace: true, state: { error } })}
            className="mt-4 inline-flex rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-400"
          >
            Back to Analyze
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-7xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200/70 bg-white/80 p-8 text-center shadow-glow backdrop-blur-xl">
        <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-brand-300 border-t-brand-600" />
        <h2 className="mt-5 text-xl font-bold text-slate-900">Analyzing your resume</h2>
        <p className="mt-2 text-sm text-slate-600">{messages[messageIndex]}</p>
      </div>
    </main>
  )
}
