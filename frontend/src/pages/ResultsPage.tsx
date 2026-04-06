import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft,
  faBriefcase,
  faChartLine,
  faCheckCircle,
  faClipboardCheck,
  faCode,
  faComments,
  faFlag,
  faGraduationCap,
  faLightbulb,
  faMoneyBillWave,
  faStar,
  faThumbsUp,
  faTimesCircle,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'
import { Link, Navigate, useLocation } from 'react-router-dom'
import type { AnalysisResponse, DeepInsights } from '../types/analysis'

interface ResultsLocationState {
  result?: AnalysisResponse
}

export function ResultsPage() {
  const location = useLocation()
  const state = location.state as ResultsLocationState | null
  const result = state?.result ?? null

  if (!result) {
    return <Navigate to="/analyze" replace />
  }

  const {
    score = 0,
    matchedSkills = [],
    missingSkills = [],
    extractedSkills = [],
    suggestions = [],
    deepInsights,
  } = result

  const fallbackAssessment =
    score >= 80
      ? 'Excellent match! Your profile aligns strongly with the job requirements.'
      : score >= 60
        ? 'Good match. You have many required skills, with room for targeted improvements.'
        : 'Fair match. Tailor your resume and build missing skills to improve fit.'

  return (
    <main className="min-h-screen bg-[#eff3f8] px-6 pb-20 pt-36">
      <div className="mx-auto max-w-[90%] space-y-8" data-aos="fade-up">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Analysis <span className="text-brand-600">Results</span>
          </h1>
          <Link
            to="/analyze"
            className="inline-flex items-center gap-2 font-semibold text-brand-600 transition-colors hover:text-brand-800"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Analyze
          </Link>
        </header>

        <section className="flex flex-col items-center gap-10 rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:flex-row">
          <ScoreRing score={score} />

          <div className="flex-1">
            <h2 className="mb-3 text-2xl font-bold text-slate-800">Overall Assessment</h2>
            {deepInsights?.overallAssessment ? (
              <div className="prose text-lg leading-relaxed text-slate-600" dangerouslySetInnerHTML={{ __html: deepInsights.overallAssessment }} />
            ) : (
              <p className="text-lg leading-relaxed text-slate-600">{fallbackAssessment}</p>
            )}

            {deepInsights?.experienceLevel && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 font-semibold text-blue-700">
                <FontAwesomeIcon icon={faBriefcase} /> Experience Level: {deepInsights.experienceLevel}
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-8 md:grid-cols-2">
          <InsightListCard
            title="Key Strengths"
            icon={faStar}
            iconClass="text-yellow-500"
            bulletIcon={faCheckCircle}
            bulletClass="text-green-500"
            items={deepInsights?.strengths}
            fallback="No strengths provided."
          />

          <InsightListCard
            title="Areas for Improvement"
            icon={faFlag}
            iconClass="text-red-500"
            bulletIcon={faTimesCircle}
            bulletClass="text-red-400"
            items={deepInsights?.weaknesses}
            fallback="No weaknesses provided."
          />
        </section>

        <section className="grid gap-8 md:grid-cols-2">
          <SkillTagCard
            title="Matched Skills"
            icon={faCheckCircle}
            iconClass="text-green-600"
            emptyText="No matching skills found."
            badgeClass="border-green-200 bg-green-50 text-green-700"
            items={matchedSkills}
          />

          <SkillTagCard
            title="Missing Skills"
            icon={faTimesCircle}
            iconClass="text-red-500"
            emptyText="No missing skills!"
            badgeClass="border-red-200 bg-red-50 text-red-600"
            items={missingSkills}
          />
        </section>

        <section>
          <SkillTagCard
            title="Extracted Skills"
            icon={faCode}
            iconClass="text-brand-600"
            emptyText="No extracted skills found."
            badgeClass="border-slate-200 bg-slate-50 text-slate-700"
            items={extractedSkills}
          />
        </section>

        {deepInsights && <ComprehensiveSection deepInsights={deepInsights} />}

        <section className="grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
            <h3 className="mb-6 flex items-center gap-3 text-xl font-bold text-slate-800">
              <FontAwesomeIcon icon={faLightbulb} className="text-amber-500" />
              Recommendations
            </h3>

            {suggestions.length > 0 ? (
              <ul className="space-y-4">
                {suggestions.map((suggestion, index) => (
                  <li key={`${suggestion}-${index}`} className="flex items-start gap-4">
                    <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-amber-400" />
                    <p className="text-slate-600">{suggestion}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="italic text-slate-500">No specific recommendations available.</p>
            )}
          </div>

          {deepInsights?.standoutQualities ? (
            <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-purple-700 p-8 text-white shadow-sm">
              <h3 className="mb-6 flex items-center gap-3 text-xl font-bold">
                <FontAwesomeIcon icon={faStar} className="text-yellow-300" />
                Standout Qualities
              </h3>
              <ul className="space-y-4">
                {deepInsights.standoutQualities.map((quality, index) => (
                  <li key={`${quality}-${index}`} className="flex items-start gap-4">
                    <FontAwesomeIcon icon={faCheckCircle} className="mt-1 shrink-0 text-blue-200" />
                    <p className="font-medium">{quality}</p>
                  </li>
                ))}
              </ul>

              <div className="mt-8 border-t border-white/20 pt-6">
                <h4 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/90">
                  <FontAwesomeIcon icon={faThumbsUp} /> Bottom Line
                </h4>
                <div
                  className="text-lg font-semibold"
                  dangerouslySetInnerHTML={{ __html: deepInsights.hiringRecommendation || 'N/A' }}
                />
                {deepInsights.salaryRange && (
                  <p className="mt-4 flex items-center gap-2 opacity-90">
                    <FontAwesomeIcon icon={faMoneyBillWave} className="text-green-300" />
                    <span className="font-medium">Estimated Value: {deepInsights.salaryRange}</span>
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
              <h3 className="mb-3 text-xl font-bold text-slate-800">Highlights</h3>
              <p className="text-slate-600">Standout qualities were not provided for this analysis.</p>
            </div>
          )}
        </section>

        {deepInsights?.interviewFocus && deepInsights.interviewFocus.length > 0 && (
          <section className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
            <h3 className="mb-6 flex items-center gap-3 text-xl font-bold text-slate-800">
              <FontAwesomeIcon icon={faClipboardCheck} className="text-blue-600" />
              Potential Interview Focus Areas
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {deepInsights.interviewFocus.map((focus, index) => (
                <div key={`${focus}-${index}`} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                    {index + 1}
                  </div>
                  <p className="text-slate-600">{focus}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

function ScoreRing({ score }: { score: number }) {
  const circleLength = 283
  const safeScore = Math.max(0, Math.min(100, Math.round(score)))
  const dashOffset = circleLength - circleLength * (safeScore / 100)

  return (
    <div className="relative flex h-48 w-48 flex-shrink-0 items-center justify-center">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth="10"
          strokeDasharray={circleLength}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          className="transition-all duration-[1500ms] ease-out"
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#9333ea" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-5xl font-extrabold text-slate-900">{safeScore}%</span>
        <span className="mt-1 text-sm font-semibold uppercase tracking-widest text-slate-500">Match</span>
      </div>
    </div>
  )
}

function InsightListCard({
  title,
  icon,
  iconClass,
  bulletIcon,
  bulletClass,
  items,
  fallback,
}: {
  title: string
  icon: any
  iconClass: string
  bulletIcon: any
  bulletClass: string
  items?: string[]
  fallback: string
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
      <h3 className="mb-6 flex items-center gap-3 text-xl font-bold text-slate-800">
        <FontAwesomeIcon icon={icon} className={iconClass} />
        {title}
      </h3>
      {items && items.length > 0 ? (
        <ul className="space-y-4">
          {items.map((item, index) => (
            <li key={`${item}-${index}`} className="flex gap-3 text-slate-600">
              <FontAwesomeIcon icon={bulletIcon} className={`${bulletClass} mt-1 shrink-0`} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="italic text-slate-500">{fallback}</p>
      )}
    </div>
  )
}

function SkillTagCard({
  title,
  icon,
  iconClass,
  items,
  badgeClass,
  emptyText,
}: {
  title: string
  icon: any
  iconClass: string
  items: string[]
  badgeClass: string
  emptyText: string
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
      <h3 className="mb-6 flex items-center gap-3 text-xl font-bold text-slate-800">
        <FontAwesomeIcon icon={icon} className={iconClass} />
        {title}
      </h3>
      <div className={'flex flex-wrap gap-2'}>
        {items.length > 0 ? (
          items.map((item, index) => (
            <span key={`${item}-${index}`} className={`rounded-lg border px-4 py-2 text-sm font-medium shadow-sm ${badgeClass}`}>
              {item}
            </span>
          ))
        ) : (
          <span className="italic text-slate-500">{emptyText}</span>
        )}
      </div>
    </div>
  )
}

function ComprehensiveSection({ deepInsights }: { deepInsights: DeepInsights }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50 p-6">
        <h3 className="flex items-center gap-3 text-xl font-bold text-slate-800">
          <FontAwesomeIcon icon={faChartLine} className="text-blue-600" />
          Comprehensive Analysis
        </h3>
      </div>

      <div className="grid gap-x-12 gap-y-10 p-6 md:grid-cols-2 md:p-8">
        <InsightHtml title="Experience Analysis" icon={faBriefcase} value={deepInsights.experienceAnalysis} />
        <InsightHtml title="Education Fit" icon={faGraduationCap} value={deepInsights.educationFit} />
        <InsightHtml title="Technical Depth" icon={faCode} value={deepInsights.technicalDepth} />
        <InsightHtml title="Culture Fit" icon={faUsers} value={deepInsights.cultureFit} />
        <InsightHtml title="Career Trajectory" icon={faChartLine} value={deepInsights.careerTrajectory} />
        <InsightHtml title="Communication Skills" icon={faComments} value={deepInsights.communicationSkills} />
      </div>
    </section>
  )
}

function InsightHtml({ title, icon, value }: { title: string; icon: any; value?: string }) {
  return (
    <div>
      <h4 className="mb-3 flex items-center gap-2 font-semibold text-slate-800">
        <FontAwesomeIcon icon={icon} className="text-blue-500" />
        {title}
      </h4>
      <div className="prose prose-sm text-slate-600" dangerouslySetInnerHTML={{ __html: value || 'N/A' }} />
    </div>
  )
}
