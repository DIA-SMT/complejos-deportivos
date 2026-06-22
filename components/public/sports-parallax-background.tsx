"use client"

import { useState } from "react"
import type { CSSProperties } from "react"
import { MigueHoverCharacter } from "@/components/public/migue-hover-character"

export function SportsParallaxBackground() {
  const [pointer, setPointer] = useState({ x: 0, y: 0 })
  const sceneStyle: CSSProperties = {
    transform: `translate3d(${pointer.x * -22}px, ${pointer.y * -16}px, 0) rotate(${pointer.x * 1.6}deg)`,
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    setPointer({
      x: ((event.clientX - bounds.left) / bounds.width - 0.5) * 2,
      y: ((event.clientY - bounds.top) / bounds.height - 0.5) * 2,
    })
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden="true">
      <div
        className="migue-hero-scene pointer-events-auto"
        style={sceneStyle}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setPointer({ x: 0, y: 0 })}
      >
        <MigueHoverCharacter />
      </div>
    </div>
  )
}
