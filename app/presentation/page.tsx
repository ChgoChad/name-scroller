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
  const [activeNames, setActiveNames] = useState<Array<{ name: string; id: number }>>([])
  const nameIdRef = useRef(0)
  const lastTimestampRef = useRef<number | null>(null)
  const timeoutsRef = useRef<number[]>([])

  // Poll for config updates
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('https://lrwfayd80qrpo4fb.public.blob.vercel-storage.com/config.json')
        const data = await response.json()
        console.log('Fetched config:', data)
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
    const names = config.names
    let currentIndex = 0
    let cancelled = false

    const clearTimers = () => {
      timeoutsRef.current.forEach(timeoutId => window.clearTimeout(timeoutId))
      timeoutsRef.current = []
    }

    const showNextName = () => {
      if (cancelled) return

      const id = nameIdRef.current++
      setActiveNames(prev => [...prev, { name: names[currentIndex], id }])

      // Remove the name after animation completes
      const removeTimeout = window.setTimeout(() => {
        if (cancelled) return
        setActiveNames(prev => prev.filter(n => n.id !== id))
      }, animationDuration)
      timeoutsRef.current.push(removeTimeout)

      currentIndex = (currentIndex + 1) % names.length

      // Start next name immediately (or with minimal delay)
      // This creates continuous scrolling effect
      const nextTimeout = window.setTimeout(showNextName, 100)
      timeoutsRef.current.push(nextTimeout)
    }

    clearTimers()
    setActiveNames([])
    showNextName()

    return () => {
      cancelled = true
      clearTimers()
      setActiveNames([])
    }
  }, [config])

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
        {activeNames.map(({ name, id }) => (
          <div
            key={id}
            className="presentation-name font-bold is-animating"
            style={nameStyle}
          >
            {name}
          </div>
        ))}
      </div>
    </div>
  )
}
