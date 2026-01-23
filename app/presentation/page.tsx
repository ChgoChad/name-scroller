'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

interface Config {
  names: string[]
  gradient: {
    from: string
    to: string
  }
  font: {
    size: number
    family: string
    color: string
  }
  animation: {
    speed: number
    pauseBetween: number
  }
  timestamp: number
}

export default function PresentationPage() {
  const [config, setConfig] = useState<Config | null>(null)
  const [currentName, setCurrentName] = useState('')
  const [isAnimating, setIsAnimating] = useState(false)
  const [nameIndex, setNameIndex] = useState(0)
  const lastTimestampRef = useRef<number | null>(null)
  const timeoutsRef = useRef<number[]>([])

  // Poll for config updates
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/config')
        const data = await response.json()

        if (typeof data?.timestamp === 'number') {
          if (lastTimestampRef.current === data.timestamp) {
            return
          }
          lastTimestampRef.current = data.timestamp
        }

        setConfig(data)
      } catch (error) {
        console.error('[v0] Failed to fetch config:', error)
      }
    }

    fetchConfig()
    const interval = setInterval(fetchConfig, 1000)
    return () => clearInterval(interval)
  }, [])

  // Animate names
  useEffect(() => {
    if (!config || config.names.length === 0) return

    const animationDuration = config.animation.speed * 1000
    const pauseDuration = config.animation.pauseBetween * 1000
    const names = config.names
    let currentIndex = 0
    let cancelled = false

    const clearTimers = () => {
      timeoutsRef.current.forEach(timeoutId => window.clearTimeout(timeoutId))
      timeoutsRef.current = []
    }

    const showNextName = () => {
      if (cancelled) return

      setCurrentName(names[currentIndex])
      setNameIndex(prev => prev + 1)
      setIsAnimating(true)

      const animationTimeout = window.setTimeout(() => {
        if (cancelled) return
        setIsAnimating(false)
        currentIndex = (currentIndex + 1) % names.length

        const pauseTimeout = window.setTimeout(showNextName, pauseDuration)
        timeoutsRef.current.push(pauseTimeout)
      }, animationDuration)

      timeoutsRef.current.push(animationTimeout)
    }

    clearTimers()
    showNextName()

    return () => {
      cancelled = true
      clearTimers()
    }
  }, [config?.timestamp, config?.animation.speed, config?.animation.pauseBetween, config?.names])

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-2xl">Loading...</div>
      </div>
    )
  }

  const gradientStyle = {
    background: `linear-gradient(to bottom right, ${config.gradient.from}, ${config.gradient.to})`
  }

  const nameStyle = {
    fontSize: `${config.font.size}px`,
    fontFamily: config.font.family,
    color: config.font.color,
    ['--scroll-duration' as string]: `${config.animation.speed}s`
  } as CSSProperties

  return (
    <div
      className="min-h-screen overflow-hidden relative"
      style={gradientStyle}
    >
      <div className="presentation-stage">
        <div
          key={`${currentName}-${nameIndex}`}
          className={`presentation-name font-bold ${isAnimating ? 'is-animating' : ''}`}
          style={nameStyle}
        >
          {currentName}
        </div>
      </div>
    </div>
  )
}
