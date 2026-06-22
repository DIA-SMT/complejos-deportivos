"use client"

import Image from "next/image"
import { useRef, useState } from "react"

export function MigueHoverCharacter() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const playAnimation = async () => {
    const video = videoRef.current
    if (!video) return

    setIsAnimating(true)
    video.currentTime = 0

    try {
      await video.play()
    } catch {
      setIsAnimating(false)
    }
  }

  const resetAnimation = () => {
    const video = videoRef.current
    if (video) {
      video.pause()
      video.currentTime = 0
    }
    setIsAnimating(false)
  }

  return (
    <div
      className="relative h-full w-full"
      aria-label="Migue, asistente del complejo"
      onPointerEnter={() => void playAnimation()}
      onPointerLeave={resetAnimation}
    >
      <Image
        src="/migue/migue-pose-saludo.png"
        alt=""
        fill
        priority
        sizes="336px"
        className={`migue-hero-character transition-opacity duration-100 ${
          isAnimating ? "opacity-0" : "opacity-100"
        }`}
      />
      <video
        ref={videoRef}
        className={`migue-hero-character absolute inset-0 transition-opacity duration-100 ${
          isAnimating ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        muted
        playsInline
        preload="auto"
        onEnded={resetAnimation}
      >
        <source src="/migue/migue-saludo-ai-clean.webm?v=3" type="video/webm" />
      </video>
    </div>
  )
}
