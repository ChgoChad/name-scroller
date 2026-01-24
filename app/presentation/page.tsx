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
  const [activeNames, setActiveNames] = useState<Array<{ name: string; id: number; delay: number }>>  ([])
  const nameIdRef = useRef(0)
  const lastTimestampRef = useRef<number | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutsRef = useRef<number[]>([])

  // Poll for config updates
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // Fetch through API proxy to avoid CORS issues
        const response = await fetch('/api/get-config', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
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

    // Calculate when to start next name:
    // Animation goes from 100vh to -100vh (200vh total travel)
    // We want next name at bottom (100vh) when current is at top (0vh)
    // That's when current has traveled 100vh out of 200vh = 50% of animation
    const delayBetweenStarts = animationDuration * 0.5

    const addName = () => {
      const id = nameIdRef.current++
      
      setActiveNames(prev => [...prev, { name: names[currentIndex], id, delay: 0 }])

      // Remove this name after animation completes
      const timeout = window.setTimeout(() => {
        setActiveNames(prev => prev.filter(n => n.id !== id))
      }, animationDuration + 500)
      
      timeoutsRef.current.push(timeout)
      currentIndex = (currentIndex + 1) % names.length
    }

    // Clean up function
    const cleanup = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      timeoutsRef.current.forEach(t => window.clearTimeout(t))
      timeoutsRef.current = []
      setActiveNames([])
      nameIdRef.current = 0
    }

    cleanup()
    
    // Add first name immediately
    addName()

    // Schedule subsequent names
    intervalRef.current = setInterval(addName, delayBetweenStarts)

    return cleanup
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
            className="presentation-name font-bold"
            style={nameStyle}
          >
            {name}
          </div>
        ))}
      </div>
    </div>
  )
}
