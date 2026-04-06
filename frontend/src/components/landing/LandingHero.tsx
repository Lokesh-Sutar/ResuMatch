import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRight,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons'

interface LandingHeroProps {
  onGetStarted: () => void
}

export function LandingHero({ onGetStarted }: LandingHeroProps) {
  const rotatingWords = ['smarter', 'targeted', 'data-driven', 'job-ready']
  const targetScore = 82
  const [wordIndex, setWordIndex] = useState(0)
  const [typedWord, setTypedWord] = useState(rotatingWords[0])
  const [animatedScore, setAnimatedScore] = useState(0)
  const currentWord = rotatingWords[wordIndex]

  useEffect(() => {
    let holdTimer: number | undefined
    let charIndex = 0

    setTypedWord('')
    const typeTimer = window.setInterval(() => {
      charIndex += 1
      setTypedWord(currentWord.slice(0, charIndex))

      if (charIndex >= currentWord.length) {
        window.clearInterval(typeTimer)
        holdTimer = window.setTimeout(() => {
          setWordIndex((previous) => (previous + 1) % rotatingWords.length)
        }, 1100)
      }
    }, 85)

    return () => {
      window.clearInterval(typeTimer)
      if (holdTimer) {
        window.clearTimeout(holdTimer)
      }
    }
  }, [currentWord, rotatingWords.length])

  useEffect(() => {
    let startTime: number | null = null
    let frameId: number | undefined

    const delayId = window.setTimeout(() => {
      const durationMs = 1400

      const animate = (timestamp: number) => {
        if (startTime === null) {
          startTime = timestamp
        }

        const progress = Math.min((timestamp - startTime) / durationMs, 1)
        setAnimatedScore(Math.round(progress * targetScore))

        if (progress < 1) {
          frameId = window.requestAnimationFrame(animate)
        }
      }

      frameId = window.requestAnimationFrame(animate)
    }, 900)

    return () => {
      window.clearTimeout(delayId)
      if (frameId) {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [])

  return (
    <section className="relative p-2 sm:p-4">

      <div className="relative">
        <div>

          <h1 className="mt-5 text-4xl font-extrabold leading-[1.02] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            <span className="block">Land better roles</span>
            <span className="block min-h-[1.06em] whitespace-nowrap">
              {'with a\u00A0'}
              <span className="inline-block min-w-[8.5ch] text-brand-700">{typedWord || '\u00A0'}</span>
            </span>
            <span className="block">resume match</span>
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Instantly compare your resume with job descriptions and get actionable improvements.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onGetStarted}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(23,77,232,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(23,77,232,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition duration-700 group-hover:translate-x-full" />
              <span className="relative">Get Started</span>
              <FontAwesomeIcon icon={faArrowRight} className="relative transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>

          <div className="relative mt-8 w-full max-w-[420px] -rotate-2 rounded-3xl border border-white/80 bg-white/45 p-5 shadow-glow backdrop-blur-xl">
            <div className="absolute -left-4 -top-4 h-14 w-14 rounded-2xl bg-brand-300/30 blur-xl" />
            <div className="absolute -bottom-4 -right-4 h-16 w-16 rounded-2xl bg-cyan-300/35 blur-xl" />

            <div className="relative rotate-2 overflow-hidden rounded-2xl border border-white/80 bg-white/80 p-5">
              <div className="hero-scan-beam" />

              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">Resume Match Score</p>
              </div>

              <p className="mt-2 text-4xl font-extrabold text-emerald-600">{animatedScore}%</p>

              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="hero-progress h-full rounded-full bg-gradient-to-r from-emerald-500 to-brand-500" />
              </div>

              <ul className="mt-4 space-y-2.5 text-sm text-slate-700">
                <li>
                  <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-emerald-500" />
                  Strong keyword match
                </li>
                <li>
                  <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-amber-500" />
                  Missing React experience
                </li>
                <li>
                  <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-brand-500" />
                  Add measurable achievements
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
