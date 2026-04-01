import { useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCloudArrowUp, faPaperPlane, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'

interface AnalyzeFormProps {
  isLoading: boolean
  onAnalyze: (file: File, jobDescription: string) => Promise<void>
}

export function AnalyzeForm({ isLoading, onAnalyze }: AnalyzeFormProps) {
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const isDisabled = useMemo(
    () => isLoading || !resumeFile || jobDescription.trim().length === 0,
    [isLoading, resumeFile, jobDescription],
  )

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormError(null)
    const file = event.target.files?.[0] ?? null
    if (!file) {
      setResumeFile(null)
      return
    }

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setFormError('Please upload a valid PDF file.')
      setResumeFile(null)
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setFormError('PDF size should be less than 10MB for reliable analysis.')
      setResumeFile(null)
      return
    }

    setResumeFile(file)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    if (!resumeFile) {
      setFormError('Resume PDF is required.')
      return
    }

    const trimmedDescription = jobDescription.trim()
    if (!trimmedDescription) {
      setFormError('Job description is required.')
      return
    }

    await onAnalyze(resumeFile, trimmedDescription)
  }

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-glow backdrop-blur-xl sm:p-6">
      <h2 className="text-xl font-semibold text-slate-900">Analyze Resume</h2>
      <p className="mt-1 text-sm text-slate-600">Upload your resume and compare it with target job requirements.</p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Resume (PDF)</span>
          <div className="relative">
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleFileChange}
              disabled={isLoading}
              className="block w-full cursor-pointer rounded-xl border border-slate-200 bg-white p-3 pr-11 text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-500 file:px-3 file:py-2 file:text-white file:transition hover:file:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
            />
            <FontAwesomeIcon
              icon={faCloudArrowUp}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-brand-300"
            />
          </div>
          {resumeFile && <span className="mt-2 block text-xs text-slate-500">Selected: {resumeFile.name}</span>}
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Job Description</span>
          <textarea
            value={jobDescription}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setJobDescription(event.target.value)}
            disabled={isLoading}
            placeholder="Paste the full job description here..."
            rows={9}
            className="w-full resize-y rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </label>

        {formError && (
          <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
            <FontAwesomeIcon icon={faTriangleExclamation} className="mr-2" />
            {formError}
          </div>
        )}

        <button
          type="submit"
          disabled={isDisabled}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FontAwesomeIcon icon={faPaperPlane} />
          {isLoading ? 'Analyzing...' : 'Analyze Resume'}
        </button>
      </form>
    </div>
  )
}
