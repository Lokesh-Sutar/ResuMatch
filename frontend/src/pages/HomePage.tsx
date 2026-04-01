import { useNavigate } from 'react-router-dom'
import { LandingHero } from '../components/landing/LandingHero'

export function HomePage() {
  const navigate = useNavigate()

  const handleGetStarted = () => {
    navigate('/analyze')
  }

  return (
    <main
      className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8"
      data-aos="zoom-in-up"
    >
      <LandingHero onGetStarted={handleGetStarted} />
    </main>
  )
}
