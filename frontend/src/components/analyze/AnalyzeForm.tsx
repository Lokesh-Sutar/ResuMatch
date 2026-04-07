import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCloudArrowUp, faFilePdf, faPaperPlane, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

interface AnalyzeFormProps {
  isLoading: boolean
  onAnalyze: (file: File, jobDescription: string, previewDataUrl?: string) => Promise<void>
}

export function AnalyzeForm({ isLoading, onAnalyze }: AnalyzeFormProps) {
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const previewUrlRef = useRef<string | null>(null)

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

    await onAnalyze(resumeFile, trimmedDescription, previewDataUrl ?? undefined)
  }

  useEffect(() => {
    let canceled = false
    let currentPreviewUrl: string | null = null

    const generatePreview = async () => {
      if (!resumeFile) {
        if (previewUrlRef.current) {
          URL.revokeObjectURL(previewUrlRef.current)
          previewUrlRef.current = null
        }
        setPreviewImageUrl(null)
        setPreviewDataUrl(null)
        setPreviewError(null)
        setIsPreviewLoading(false)
        return
      }

      setIsPreviewLoading(true)
      setPreviewError(null)

      try {
        const pdfjsLib = await import('pdfjs-dist')
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc

        const bytes = new Uint8Array(await resumeFile.arrayBuffer())
        const pdf = await pdfjsLib.getDocument({ data: bytes }).promise
        const page = await pdf.getPage(1)

        const viewport = page.getViewport({ scale: 0.85 })
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        if (!context) {
          throw new Error('Could not initialize preview renderer.')
        }

        canvas.width = Math.floor(viewport.width)
        canvas.height = Math.floor(viewport.height)

        await page.render({ canvasContext: context, viewport }).promise

        const cropWhiteMargins = (source: HTMLCanvasElement) => {
          const ctx = source.getContext('2d')
          if (!ctx) {
            return source
          }

          const { width, height } = source
          const { data } = ctx.getImageData(0, 0, width, height)

          let minX = width
          let minY = height
          let maxX = 0
          let maxY = 0
          let found = false

          for (let y = 0; y < height; y += 2) {
            for (let x = 0; x < width; x += 2) {
              const i = (y * width + x) * 4
              const r = data[i]
              const g = data[i + 1]
              const b = data[i + 2]
              const a = data[i + 3]

              const isNearWhite = r > 246 && g > 246 && b > 246
              if (a > 0 && !isNearWhite) {
                found = true
                if (x < minX) minX = x
                if (x > maxX) maxX = x
                if (y < minY) minY = y
                if (y > maxY) maxY = y
              }
            }
          }

          if (!found) {
            return source
          }

          const padding = 14
          const sx = Math.max(0, minX - padding)
          const sy = Math.max(0, minY - padding)
          const sw = Math.min(width - sx, maxX - minX + 1 + padding * 2)
          const sh = Math.min(height - sy, maxY - minY + 1 + padding * 2)

          const cropped = document.createElement('canvas')
          cropped.width = sw
          cropped.height = sh
          const croppedCtx = cropped.getContext('2d')
          if (!croppedCtx) {
            return source
          }

          croppedCtx.drawImage(source, sx, sy, sw, sh, 0, 0, sw, sh)
          return cropped
        }

        const previewCanvas = cropWhiteMargins(canvas)
        const previewData = previewCanvas.toDataURL('image/webp', 0.72)

        const blob = await new Promise<Blob>((resolve, reject) => {
          previewCanvas.toBlob(
            (value) => {
              if (!value) {
                reject(new Error('Failed to create preview image.'))
                return
              }
              resolve(value)
            },
            'image/webp',
            0.75,
          )
        })

        currentPreviewUrl = URL.createObjectURL(blob)
        if (!canceled) {
          if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current)
          }
          previewUrlRef.current = currentPreviewUrl
          setPreviewImageUrl(currentPreviewUrl)
          setPreviewDataUrl(previewData)
        }

        await pdf.destroy()
      } catch {
        if (!canceled) {
          setPreviewError('Could not generate PDF preview. You can still analyze this file.')
          if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current)
            previewUrlRef.current = null
          }
          setPreviewImageUrl(null)
          setPreviewDataUrl(null)
        }
      } finally {
        if (!canceled) {
          setIsPreviewLoading(false)
        } else if (currentPreviewUrl) {
          URL.revokeObjectURL(currentPreviewUrl)
        }
      }
    }

    void generatePreview()

    return () => {
      canceled = true
    }
  }, [resumeFile])

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
        previewUrlRef.current = null
      }
    }
  }, [])

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-glow backdrop-blur-xl sm:p-6">
      <h2 className="text-xl font-semibold text-slate-900">Analyze Resume</h2>
      <p className="mt-1 text-sm text-slate-600">Upload your resume and compare it with target job requirements.</p>

      <form
        onSubmit={handleSubmit}
        className={`mt-5 grid gap-5 transition-all duration-500 ease-out ${resumeFile ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}
      >
        <div className="space-y-4" data-aos="fade-right">
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
        </div>

        {resumeFile && (
          <aside className="lg:pl-1" data-aos="fade-left" data-aos-delay="120" data-aos-duration="520">
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 transition-all duration-500 ease-out">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                <FontAwesomeIcon icon={faFilePdf} className="text-red-500" />
                PDF Preview
              </div>

              {isPreviewLoading && (
                <div className="flex h-72 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm text-slate-500">
                  Generating optimized preview...
                </div>
              )}

              {!isPreviewLoading && previewImageUrl && (
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <img src={previewImageUrl} alt="Resume preview (first page)" className="h-auto max-h-[32rem] w-full object-contain" />
                </div>
              )}

              {!isPreviewLoading && !previewImageUrl && (
                <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-4 text-center text-sm text-slate-500">
                  {previewError ?? 'Upload a PDF to see an optimized first-page preview.'}
                </div>
              )}
            </div>
          </aside>
        )}
      </form>
    </div>
  )
}
