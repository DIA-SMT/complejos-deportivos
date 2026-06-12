"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import type { CSSProperties } from "react"

export function SportsParallaxBackground() {
  const [pointer, setPointer] = useState({ x: 0, y: 0 })
  const sceneStyle: CSSProperties = {
    transform: `translate3d(${pointer.x * -22}px, ${pointer.y * -16}px, 0) rotate(${pointer.x * 1.6}deg)`,
  }

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      setPointer({
        x: (event.clientX / window.innerWidth - 0.5) * 2,
        y: (event.clientY / window.innerHeight - 0.5) * 2,
      })
    }

    window.addEventListener("pointermove", handlePointerMove)
    return () => window.removeEventListener("pointermove", handlePointerMove)
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden" aria-hidden="true">
      <div
        className="migue-hero-scene pointer-events-auto"
        style={sceneStyle}
      >
        <Image
          src="/images/migue-avatar-cutout.png"
          alt=""
          width={520}
          height={520}
          priority
          className="migue-hero-character"
        />
      </div>
    </div>
  )
}
