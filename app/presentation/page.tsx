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
  const [activeNames, setActiveNames] = useState<Array<{ name: string; id: number; startTime: number }>>([])
  const nameIdRef = useRef(0)
  const lastTimestampRef = useRef<number | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

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

    // Calculate delay: start next name when current name reaches top of screen
    // Animation goes from 110vh to -120vh (total 230vh travel)
    // We want next name at bottom (110vh) when current reaches top (0vh)
    // That's when current has traveled 110vh out of 230vh = ~48% of animation
    const delayBetweenStarts = animationDuration * 0.48

    const addName = () => {
      const id = nameIdRef.current++
      const startTime = Date.now()
      
      setActiveNames(prev => [...prev, { name: names[currentIndex], id, startTime }])

      // Schedule removal of this name after animation completes
      setTimeout(() => {
        setActiveNames(prev => prev.filter(n => n.id !== id))
      }, animationDuration + 100)

      currentIndex = (currentIndex + 1) % names.length
    }

    // Clear any existing names and start fresh
    setActiveNames([])
    nameIdRef.current = 0
    
    // Add first name immediately
    addName()

    // Schedule subsequent names
    intervalRef.current = setInterval(addName, delayBetweenStarts)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
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
