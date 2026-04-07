import type { AnalysisResponse } from '../types/analysis'

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
const isLocalHost = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)
const API_BASE_URL = configuredBaseUrl || (isLocalHost ? 'http://localhost:8000' : '')
const ANALYZE_ENDPOINT = `${API_BASE_URL}/api/analyze`
const REQUEST_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS ?? 120000)

function parseBackendError(payload: unknown): string {
  if (!payload || typeof payload !== 'object') {
    return 'Request failed. Please try again.'
  }

  const maybeDetail = (payload as { detail?: unknown }).detail
  if (typeof maybeDetail === 'string' && maybeDetail.trim().length > 0) {
    return maybeDetail
  }

  return 'Request failed. Please try again.'
}

export async function analyzeResume(file: File, jobDescription: string): Promise<AnalysisResponse> {
  const formData = new FormData()
  formData.append('resume', file)
  formData.append('job_description', jobDescription)

  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(ANALYZE_ENDPOINT, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    })

    if (!response.ok) {
      let message = `Server returned ${response.status}`
      try {
        const errorPayload = await response.json()
        message = parseBackendError(errorPayload)
      } catch {
        // Keep fallback message if body cannot be parsed
      }

      throw new Error(message)
    }

    const data = (await response.json()) as AnalysisResponse

    const hasInvalidShape =
      typeof data.score !== 'number' ||
      !Array.isArray(data.extractedSkills) ||
      !Array.isArray(data.matchedSkills) ||
      !Array.isArray(data.missingSkills) ||
      !Array.isArray(data.suggestions) ||
      (data.deepInsights !== undefined && (typeof data.deepInsights !== 'object' || data.deepInsights === null))

    if (hasInvalidShape) {
      throw new Error('Received malformed response from server.')
    }

    return data
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Request timed out. Backend may still be processing. Please retry in a moment or increase API timeout.')
    }

    if (error instanceof TypeError) {
      throw new Error('Network error. Ensure backend is running and reachable.')
    }

    throw error instanceof Error ? error : new Error('Unexpected error while contacting backend.')
  } finally {
    clearTimeout(timeoutId)
  }
}
