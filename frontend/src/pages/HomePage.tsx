import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { LandingHero } from '../components/landing/LandingHero'

export function HomePage() {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) {
      return
    }

    // Keep full intro, then loop a smoother segment to reduce perceived stutter.
    const segmentStartSeconds = 5
    const segmentEndSeconds = 11

    const handleTimeUpdate = () => {
      if (video.currentTime >= segmentEndSeconds) {
        video.currentTime = segmentStartSeconds
      }
    }

    const handleLoadedMetadata = () => {
      if (video.duration > segmentEndSeconds) {
        return
      }

      // Fallback to native full loop if file is shorter than desired segment.
      video.loop = true
      video.removeEventListener('timeupdate', handleTimeUpdate)
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
  }, [])

  const handleGetStarted = () => {
    navigate('/analyze')
  }

  return (
    <main
      className="relative min-h-screen w-full overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          autoPlay
          muted
          playsInline
          preload="auto"
        >
          <source src="/background/bg.webm" type="video/webm" />
        </video>
      </div>

      <div className="mx-auto flex min-h-screen w-[90%] items-center px-4 pb-8 pt-28 sm:px-6 lg:px-8" data-aos="fade-right" data-aos-once="true">
        <div className="relative z-10 w-full lg:max-w-5xl">
          <LandingHero onGetStarted={handleGetStarted} />
        </div>
      </div>
    </main>
  )
}
