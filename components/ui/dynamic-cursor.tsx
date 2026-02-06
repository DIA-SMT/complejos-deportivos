"use client"

import { useEffect, useState } from "react"

const BALLS = [
    // Soccer ball
    `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" style="font-size: 24px;"><text y="22" x="0">⚽</text></svg>') 16 16, auto`,
    // Basketball
    `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" style="font-size: 24px;"><text y="22" x="0">🏀</text></svg>') 16 16, auto`,
    // Tennis ball
    `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" style="font-size: 24px;"><text y="22" x="0">🎾</text></svg>') 16 16, auto`,
    // Volleyball
    `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" style="font-size: 24px;"><text y="22" x="0">🏐</text></svg>') 16 16, auto`,
    // Ruby
    `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" style="font-size: 24px;"><text y="22" x="0">🏉</text></svg>') 16 16, auto`
]

export function DynamicCursor() {
    const [currentBallIndex, setCurrentBallIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBallIndex((prev) => (prev + 1) % BALLS.length)
        }, 1000) // Change every 1 segundo

        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        document.documentElement.style.cursor = BALLS[currentBallIndex]

        // Also apply to body to ensure coverage
        document.body.style.cursor = BALLS[currentBallIndex]

        return () => {
            document.documentElement.style.cursor = 'auto'
            document.body.style.cursor = 'auto'
        }
    }, [currentBallIndex])

    return null
}
