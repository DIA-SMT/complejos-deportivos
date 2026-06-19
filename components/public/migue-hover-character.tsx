"use client"

import { useEffect, useRef } from "react"

export function MigueHoverCharacter() {
  const videoRef = useRef<HTMLVideoElement>(null)

  const playAnimation = async (restart = true) => {
    const video = videoRef.current
    if (!video) return

    if (restart) {
      video.currentTime = 0
    }

    try {
      await video.play()
    } catch {
      // Autoplay can be blocked by browser or user motion preferences.
    }
  }

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)")
    const video = videoRef.current

    if (!video || motionPreference.matches) return

    const startWhenReady = () => {
      void playAnimation(false)
    }

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      startWhenReady()
    } else {
      video.addEventListener("canplay", startWhenReady, { once: true })
    }

    return () => {
      video.removeEventListener("canplay", startWhenReady)
      video.pause()
    }
  }, [])

  return (
    <video
      ref={videoRef}
      className="migue-hero-character"
      muted
      playsInline
      preload="metadata"
      poster="/images/migue-avatar-cutout.png"
      aria-label="Migue, asistente del complejo"
      onPointerEnter={() => void playAnimation()}
      onPointerDown={() => void playAnimation()}
    >
      <source src="/migue/migue-saludo-transparente.webm" type="video/webm" />
    </video>
  )
}
