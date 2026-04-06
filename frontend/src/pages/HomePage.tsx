import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LandingHero } from '../components/landing/LandingHero'

export function HomePage() {
  const navigate = useNavigate()
  const [frame, setFrame] = useState(1)

  useEffect(() => {
    const totalFrames = 297
    const loopStartFrame = 139
    const interval = window.setInterval(() => {
      setFrame((previous) => (previous < totalFrames ? previous + 1 : loopStartFrame))
    }, 1000 / 40)

    return () => window.clearInterval(interval)
  }, [])

  const handleGetStarted = () => {
    navigate('/analyze')
  }

  return (
    <main
      className="relative min-h-screen w-full overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
        <img
          src={`/background/bg_${String(frame).padStart(3, '0')}.webp`}
          alt="Background animation"
          className="h-full w-full object-cover"
          loading="eager"
        />
      </div>

      <div className="mx-auto flex min-h-screen w-[90%] items-center px-4 pb-8 pt-28 sm:px-6 lg:px-8" data-aos="fade-right" data-aos-once="true">
        <div className="relative z-10 w-full lg:max-w-5xl">
          <LandingHero onGetStarted={handleGetStarted} />
        </div>
      </div>
    </main>
  )
}
