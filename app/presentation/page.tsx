'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import Image from 'next/image'

interface Config {
  title: string
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
  logo?: {
    useAlternate: boolean
    opacity: number
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
  const animationHashRef = useRef('')
  const namesListHashRef = useRef('')

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
    const interval = setInterval(fetchConfig, 5000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Animate names - one at a time
  useEffect(() => {
    if (!config || config.names.length === 0) return

    const currentNamesHash = config.names.join('|')
    const namesChanged = namesListHashRef.current !== currentNamesHash
    
    namesListHashRef.current = currentNamesHash

    console.log('Config changed:', {
      namesChanged,
      nameCount: config.names.length,
      speed: config.animation.speed,
      pauseBetween: config.animation.pauseBetween,
      currentIndex: nameIndexRef.current
    })

    // Clear any existing timeout
    if (intervalRef.current) {
      clearTimeout(intervalRef.current)
      intervalRef.current = null
    }

    const showNextName = () => {
      const names = configRef.current?.names || []
      if (names.length === 0) return

      const currentIndex = nameIndexRef.current % names.length
      const animSpeed = configRef.current?.animation.speed || 10
      const pauseTime = configRef.current?.animation.pauseBetween || 0
      const totalDelay = (animSpeed + pauseTime) * 1000
      
      console.log(`[${new Date().toLocaleTimeString()}] Showing name #${currentIndex}: "${names[currentIndex]}" (will show next in ${totalDelay}ms)`)
      
      setCurrentName(names[currentIndex])
      setNameKey(prev => prev + 1)
      
      // Move to next name
      nameIndexRef.current = (nameIndexRef.current + 1) % names.length
      
      // Schedule next name
      intervalRef.current = setTimeout(showNextName, totalDelay)
    }

    // Start immediately from current position
    showNextName()

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current)
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
      {/* Fire Department Logo Background */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <div 
          className="relative"
          style={{
            width: '60vw',
            height: '60vh',
            opacity: (config.logo?.opacity ?? 40) / 100
          }}
        >
          <Image 
            src={config.logo?.useAlternate ? "/ProjectFireBuddies_Logo_NoWhite.png" : "/ProjectFireBuddies_Logo.png"}
            alt="Fire Department Logo"
            fill
            sizes="60vw"
            className="object-contain"
            priority
          />
        </div>
      </div>

      {config.title && (
        <div 
          className="absolute top-8 left-0 right-0 text-center font-bold px-4"
          style={{
            fontSize: `${config.font.size * 0.8}px`,
            fontFamily: config.font.family,
            color: config.font.color,
            zIndex: 10
          }}
        >
          {config.title}
        </div>
      )}
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
