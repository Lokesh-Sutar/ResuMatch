import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconProp } from '@fortawesome/fontawesome-svg-core'
import type { ReactNode } from 'react'
import {
  faBolt,
  faCircleCheck,
  faCircleXmark,
  faFlag,
  faLightbulb,
  faMedal,
  faShield,
  faSitemap,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons'
import type { AnalysisResponse, DeepInsights } from '../../types/analysis'

interface ResultsPanelProps {
  isLoading: boolean
  error: string | null
  result: AnalysisResponse | null
}

export function ResultsPanel({ isLoading, error, result }: ResultsPanelProps) {
  if (isLoading) {
    return (
      <Panel>
        <div className="flex items-center gap-3 text-slate-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-300 border-t-transparent" />
          <span>Running analysis...</span>
        </div>
      </Panel>
    )
  }

  if (error) {
    return (
      <Panel>
        <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-red-200">
          <h3 className="font-semibold">
            <FontAwesomeIcon icon={faTriangleExclamation} className="mr-2" />
            Analysis failed
          </h3>
          <p className="mt-1 text-sm text-red-100">{error}</p>
        </div>
      </Panel>
    )
  }

  if (!result) {
    return null
  }

  return (
    <Panel>
      <div className="grid gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">Overall Match Score</p>
          <div className="mt-3 flex items-end gap-3">
            <span className="text-4xl font-extrabold text-slate-900">{Math.round(result.score)}%</span>
            <span className="pb-1 text-sm text-slate-600">fit probability</span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <SkillCard title="Matched Skills" icon={faCircleCheck} colorClass="text-emerald-300" skills={result.matchedSkills} />
          <SkillCard title="Missing Skills" icon={faCircleXmark} colorClass="text-amber-300" skills={result.missingSkills} />
        </div>

        <SkillCard title="Extracted Skills" icon={faBolt} colorClass="text-brand-200" skills={result.extractedSkills} />

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900">
            <FontAwesomeIcon icon={faLightbulb} className="mr-2 text-yellow-300" />
            Suggestions
          </h3>
          {result.suggestions.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {result.suggestions.map((suggestion) => (
                <li key={suggestion} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  {suggestion}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-600">No suggestions available.</p>
          )}
        </div>

        {result.deepInsights && <DeepInsightsPanel deepInsights={result.deepInsights} />}
      </div>
    </Panel>
  )
}

function DeepInsightsPanel({ deepInsights }: { deepInsights: DeepInsights }) {
  const knownKeys: Array<keyof DeepInsights> = [
    'overallAssessment',
    'experienceLevel',
    'salaryRange',
    'hiringRecommendation',
    'strengths',
    'weaknesses',
    'redFlags',
    'standoutQualities',
    'recommendedActions',
    'interviewFocus',
    'experienceAnalysis',
    'educationFit',
    'cultureFit',
    'careerTrajectory',
    'technicalDepth',
    'communicationSkills',
  ]

  const additionalEntries = Object.entries(deepInsights as Record<string, unknown>).filter(([key, value]) => {
    return !knownKeys.includes(key as keyof DeepInsights) && value !== null && value !== undefined && value !== ''
  })

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900">
        <FontAwesomeIcon icon={faSitemap} className="mr-2 text-brand-200" />
        Deep Insights
      </h3>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <InsightText title="Overall Assessment" value={deepInsights.overallAssessment} icon={faShield} />
        <InsightText title="Experience Level" value={deepInsights.experienceLevel} icon={faMedal} />
        <InsightText title="Salary Range" value={deepInsights.salaryRange} icon={faMedal} />
        <InsightText title="Hiring Recommendation" value={deepInsights.hiringRecommendation} icon={faFlag} />
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <InsightList title="Strengths" items={deepInsights.strengths} />
        <InsightList title="Weaknesses" items={deepInsights.weaknesses} />
        <InsightList title="Red Flags" items={deepInsights.redFlags} />
        <InsightList title="Standout Qualities" items={deepInsights.standoutQualities} />
        <InsightList title="Recommended Actions" items={deepInsights.recommendedActions} />
        <InsightList title="Interview Focus" items={deepInsights.interviewFocus} />
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <InsightText title="Experience Analysis" value={deepInsights.experienceAnalysis} />
        <InsightText title="Education Fit" value={deepInsights.educationFit} />
        <InsightText title="Culture Fit" value={deepInsights.cultureFit} />
        <InsightText title="Career Trajectory" value={deepInsights.careerTrajectory} />
        <InsightText title="Technical Depth" value={deepInsights.technicalDepth} />
        <InsightText title="Communication Skills" value={deepInsights.communicationSkills} />
      </div>

      {additionalEntries.length > 0 && (
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Additional Insights</p>
          <div className="mt-2 space-y-2 text-sm text-slate-700">
            {additionalEntries.map(([key, value]) => (
              <div key={key}>
                <p className="font-semibold text-slate-800">{formatLabel(key)}</p>
                <p>{Array.isArray(value) ? value.join(', ') : String(value)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function formatLabel(raw: string) {
  return raw
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase())
    .trim()
}

function InsightList({ title, items }: { title: string; items?: string[] }) {
  if (!items || items.length === 0) {
    return null
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">{title}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
        {items.map((item) => (
          <li key={`${title}-${item}`}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

function InsightText({ title, value, icon }: { title: string; value?: string; icon?: IconProp }) {
  if (!value) {
    return null
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
        {icon ? <FontAwesomeIcon icon={icon} className="mr-2 text-brand-200" /> : null}
        {title}
      </p>
      <div className="mt-2 text-sm text-slate-700" dangerouslySetInnerHTML={{ __html: value }} />
    </div>
  )
}

interface SkillCardProps {
  title: string
  icon: IconProp
  colorClass: string
  skills: string[]
}

function SkillCard({ title, icon, colorClass, skills }: SkillCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900">
        <FontAwesomeIcon icon={icon} className={`mr-2 ${colorClass}`} />
        {title}
      </h3>

      {skills.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No data</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={`${title}-${skill}`}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700"
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function Panel({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-glow backdrop-blur-xl sm:p-6">{children}</div>
}
