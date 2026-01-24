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
  const [activeNames, setActiveNames] = useState<Array<{ name: string; id: number; delay: number }>>([])
  const [animationStarted, setAnimationStarted] = useState(false)
  const nameIdRef = useRef(0)
  const lastTimestampRef = useRef<number | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutsRef = useRef<number[]>([])
  const configRef = useRef<Config | null>(null)

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
        
        // Trigger animation start
        if (!animationStarted) {
          setAnimationStarted(true)
        }
      } catch (error) {
        console.error('[v0] Failed to fetch config:', error)
      }
    }

    fetchConfig()
    const interval = setInterval(fetchConfig, 1000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Animate names - only run once when animation is started
  useEffect(() => {
    if (!animationStarted) return
    
    console.log('Animation effect starting')
    
    const startAnimationLoop = () => {
      const currentConfig = configRef.current
      if (!currentConfig || currentConfig.names.length === 0) {
        console.log('No config or names, retrying in 1s')
        setTimeout(startAnimationLoop, 1000)
        return
      }

      const animationDuration = currentConfig.animation.speed * 1000
      const names = currentConfig.names
      let currentIndex = 0

      // Calculate when to start next name:
      // Animation goes from 100vh to -100vh (200vh total travel)
      // We want next name at bottom (100vh) when current is at top (0vh)
      // That's when current has traveled 100vh out of 200vh = 50% of animation
      const delayBetweenStarts = animationDuration * 0.5

      const addName = () => {
        const currentConfig = configRef.current
        if (!currentConfig) return
        
        const names = currentConfig.names
        const animationDuration = currentConfig.animation.speed * 1000
        
        const id = nameIdRef.current++
        
        console.log(`[${new Date().toLocaleTimeString()}] Adding name #${id}: ${names[currentIndex]}`)
        setActiveNames(prev => {
          const newList = [...prev, { name: names[currentIndex], id, delay: 0 }]
          console.log(`Active names count: ${newList.length}`, newList.map(n => `#${n.id}:${n.name}`))
          return newList
        })

        // Remove this name after animation completes
        const timeout = window.setTimeout(() => {
          console.log(`[${new Date().toLocaleTimeString()}] Removing name #${id}`)
          setActiveNames(prev => prev.filter(n => n.id !== id))
        }, animationDuration + 500)
        
        timeoutsRef.current.push(timeout)
        currentIndex = (currentIndex + 1) % names.length
      }

      console.log(`Starting animation loop. Duration: ${animationDuration}ms, Delay between: ${delayBetweenStarts}ms`)
      
      // Add first name immediately
      addName()

      // Schedule subsequent names
      console.log(`Setting interval to add names every ${delayBetweenStarts}ms`)
      intervalRef.current = setInterval(() => {
        console.log('Interval fired!')
        addName()
      }, delayBetweenStarts)
    }

    startAnimationLoop()

    // Cleanup function - only runs when component unmounts
    return () => {
      console.log('Component unmounting - clearing all timers')
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      timeoutsRef.current.forEach(t => window.clearTimeout(t))
      timeoutsRef.current = []
    }
  }, [animationStarted])

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
        {activeNames.map(({ name, id }) => (
          <NameScroller 
            key={id} 
            name={name} 
            nameStyle={nameStyle}
          />
        ))}
      </div>
    </div>
  )
}

// Separate component to ensure animation triggers for each name
function NameScroller({ name, nameStyle }: { name: string; nameStyle: CSSProperties }) {
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Delay animation start to ensure element is in DOM
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setShouldAnimate(true)
      })
    })
  }, [])

  return (
    <div
      ref={elementRef}
      className={`presentation-name font-bold ${shouldAnimate ? 'is-animating' : ''}`}
      style={nameStyle}
    >
      {name}
    </div>
  )
}
