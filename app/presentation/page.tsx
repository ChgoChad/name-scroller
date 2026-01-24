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

interface NameSlot {
  id: number
  name: string
  isAnimating: boolean
  startDelay: number
  renderKey: number
}

export default function PresentationPage() {
  const [config, setConfig] = useState<Config | null>(null)
  const [currentName, setCurrentName] = useState('')
  const [nameKey, setNameKey] = useState(0)
  const lastTimestampRef = useRef<number | null>(null)
  const configRef = useRef<Config | null>(null)
  const nameIndexRef = useRef(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const namesHashRef = useRef('')

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
        
        // Only update config if timestamp actually changed
        if (typeof data?.timestamp === 'number') {
          if (lastTimestampRef.current === data.timestamp) {
            return // Don't update state if timestamp hasn't changed
          }
          console.log('Config timestamp changed, updating config')
          lastTimestampRef.current = data.timestamp
        }

        configRef.current = data
        setConfig(data)
      } catch (error) {
        console.error('[v0] Failed to fetch config:', error)
      }
    }

    fetchConfig()
    const interval = setInterval(fetchConfig, 1000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Animate names - one at a time
  useEffect(() => {
    if (!config || config.names.length === 0) return

    // Check if names actually changed
    const currentNamesHash = config.names.join('|')
    if (namesHashRef.current === currentNamesHash && intervalRef.current) {
      // Names haven't changed, keep existing animation running
      return
    }
    
    namesHashRef.current = currentNamesHash
    console.log('Names changed, restarting animation')

    const showNextName = () => {
      const names = configRef.current?.names || []
      const duration = (configRef.current?.animation.speed || 10) * 1000
      
      if (names.length === 0) return

      const nextIndex = nameIndexRef.current % names.length
      console.log(`Showing name #${nextIndex}: ${names[nextIndex]} (duration: ${duration}ms)`)
      
      setCurrentName(names[nextIndex])
      setNameKey(prev => prev + 1)
      
      nameIndexRef.current++
      
      // Schedule next name based on current config
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = setInterval(() => {
        showNextName()
      }, duration)
    }

    // Reset index and show first name immediately
    nameIndexRef.current = 0
    showNextName()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
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
    ['--scroll-duration' as string]: `${config.animation.speed}s`,
    ['--font-size' as string]: `${config.font.size}px`
  } as CSSProperties

  return (
    <div
      className="min-h-screen overflow-hidden relative"
      style={gradientStyle}
    >
      <div className="presentation-stage">
        {currentName && (
          <div
            key={nameKey}
            className="presentation-name font-bold is-animating"
            style={nameStyle}
          >
            {currentName}
          </div>
        )}
      </div>
    </div>
  )
}
