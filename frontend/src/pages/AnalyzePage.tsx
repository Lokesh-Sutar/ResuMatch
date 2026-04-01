import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnalyzeForm } from '../components/analyze/AnalyzeForm'
import { analyzeResume } from '../services/api'

export function AnalyzePage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <main className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-2xl space-y-4" data-aos="fade-up">
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
