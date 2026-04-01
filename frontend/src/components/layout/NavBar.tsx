import type { SyntheticEvent } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

export function NavBar() {
  const { pathname } = useLocation()

  const currentStep = pathname.startsWith('/results') ? 3 : pathname.startsWith('/analyze') ? 2 : 1

  return (
    <nav className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl rounded-3xl border border-white/70 bg-white/65 shadow-glow backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
          <NavLink to="/" className="inline-flex items-center gap-3">
            <img
              src="/logo/resumatch-logo.webp"
              alt="ResuMatch logo"
              className="h-16 object-contain"
              onError={(event: SyntheticEvent<HTMLImageElement>) => {
                event.currentTarget.style.display = 'none'
              }}
            />
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">
              <span>Resu</span>
              <span className="text-brand-600">Match</span>
            </span>
          </NavLink>

          <ol className="hidden items-center gap-3 md:flex">
            <StepItem label="Home" step={1} currentStep={currentStep} />
            <StepDivider active={currentStep >= 2} />
            <StepItem label="Analyze" step={2} currentStep={currentStep} />
            <StepDivider active={currentStep >= 3} />
            <StepItem label="Results" step={3} currentStep={currentStep} />
          </ol>

          <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700 md:hidden">
            Step {currentStep} / 3
          </span>
        </div>
      </div>
    </nav>
  )
}

function StepItem({
  label,
  step,
  currentStep,
}: {
  label: string
  step: number
  currentStep: number
}) {
  const completed = step < currentStep
  const active = step === currentStep

  return (
    <li>
      <div className="inline-flex items-center gap-2 text-sm">
        <span
          className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold transition ${
            active
              ? 'border-brand-500 bg-brand-500 text-white'
              : completed
                ? 'border-brand-300 bg-brand-100 text-brand-700'
                : 'border-slate-300 bg-white text-slate-500'
          }`}
        >
          {step}
        </span>
        <span className={`font-semibold ${active ? 'text-brand-700' : completed ? 'text-slate-700' : 'text-slate-500'}`}>
          {label}
        </span>
      </div>
    </li>
  )
}

function StepDivider({ active }: { active: boolean }) {
  return (
    <li>
      <span className={`block h-[2px] w-8 rounded-full ${active ? 'bg-brand-400' : 'bg-slate-300'}`} />
    </li>
  )
}
