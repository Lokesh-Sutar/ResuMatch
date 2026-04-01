import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWandMagicSparkles, faFileArrowUp, faBullseye } from '@fortawesome/free-solid-svg-icons'
import type { IconProp } from '@fortawesome/fontawesome-svg-core'

export function Header() {
  return (
    <header className="rounded-5xl border border-white/10 bg-slate-900/60 p-6 shadow-glow backdrop-blur-xl sm:p-8">
      <div className="flex flex-wrap items-center gap-3 text-brand-200">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-300/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
          <FontAwesomeIcon icon={faWandMagicSparkles} />
          AI Resume Intelligence
        </span>
      </div>

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
        ResuMatch Dashboard
      </h1>

      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">
        Upload your resume, paste a job description, and instantly get a modern, actionable breakdown of your
        profile fit.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatPill icon={faFileArrowUp} label="PDF Resume" />
        <StatPill icon={faBullseye} label="Skill Match Score" />
        <StatPill icon={faWandMagicSparkles} label="AI Suggestions" />
      </div>
    </header>
  )
}

interface StatPillProps {
  icon: IconProp
  label: string
}

function StatPill({ icon, label }: StatPillProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
      <FontAwesomeIcon icon={icon} className="text-brand-300" />
      <span>{label}</span>
    </div>
  )
}
