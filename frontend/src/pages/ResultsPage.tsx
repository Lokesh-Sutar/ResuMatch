import { Link, useLocation } from 'react-router-dom'
import { ResultsPanel } from '../components/analyze/ResultsPanel'
import type { AnalysisResponse } from '../types/analysis'

interface ResultsLocationState {
  result?: AnalysisResponse
}

export function ResultsPage() {
  const location = useLocation()
  const state = location.state as ResultsLocationState | null
  const result = state?.result ?? null

  if (!result) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-7xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-xl rounded-2xl border border-slate-200/70 bg-white/80 p-6 text-center shadow-glow backdrop-blur-xl">
          <h2 className="text-xl font-bold text-slate-900">No analysis found</h2>
          <p className="mt-2 text-sm text-slate-600">Please run an analysis first.</p>
          <Link
            to="/analyze"
            className="mt-4 inline-flex rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-400"
          >
            Go to Analyze
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl" data-aos="zoom-in-up">
        <ResultsPanel isLoading={false} error={null} result={result} />
      </div>
    </main>
  )
}
