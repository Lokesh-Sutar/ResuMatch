import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnalyzeForm } from '../components/analyze/AnalyzeForm'
import { analyzeResume } from '../services/api'

export function AnalyzePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingPreviewUrl, setLoadingPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const state = location.state as { error?: string } | null
    if (state?.error) {
      setError(state.error)
    }
  }, [location.state])

  const handleAnalyze = async (file: File, jobDescription: string, previewDataUrl?: string) => {
    setLoadingPreviewUrl(previewDataUrl ?? null)
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
      setLoadingPreviewUrl(null)
    }
  }

  if (isLoading) {
    return (
      <main className="scan-loading-shell mx-auto flex min-h-screen max-h-screen w-full max-w-7xl items-start px-4 pt-36 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-xl max-h-[80vh]">
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
            <div className="scan-preview scan-blink rounded-lg border border-slate-200 bg-white">
              {loadingPreviewUrl ? (
                <img src={loadingPreviewUrl} alt="Resume scanning preview" className="w-full max-h-[80vh] object-contain" />
              ) : (
                <div className="flex h-[28rem] items-center justify-center text-sm text-slate-500">Analyzing your resume...</div>
              )}
              <span className="scan-beam-diagonal" />
            </div>
          </div>
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
