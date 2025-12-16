"use client"

import { useEffect, useState, useMemo } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { Image, Music, Film, Brush, Camera, Mic } from 'lucide-react'

const icons = [Music, Film, Brush, Camera, Mic, Image]

interface BubbleExplosionProps {
  onComplete: () => void
}

const BubbleExplosion = ({ onComplete }: BubbleExplosionProps) => {
  const fragments = Array.from({ length: 12 }, () => ({
    dx: (Math.random() - 0.5) * 80,
    dy: (Math.random() - 0.5) * 80,
    delay: Math.random() * 0.1,
    size: Math.random() * 5 + 3,
  }))

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {fragments.map((f, i) => (
        <motion.div
          key={i}
          className="rounded-full bg-gradient-to-tr from-sky-400/50 to-blue-500/50"
          style={{ width: f.size, height: f.size }}
          initial={{ scale: 1, opacity: 1, x: 0, y: 0 }}
          animate={{ scale: 0, opacity: 0, x: f.dx, y: f.dy }}
          transition={{ duration: 0.5 + Math.random() * 0.2, delay: f.delay, ease: 'easeOut' }}
          onAnimationComplete={i === fragments.length - 1 ? onComplete : undefined}
        />
      ))}
    </div>
  )
}

interface BubbleProps {
  id: number
  x: number
  onComplete: (id: number) => void
}

const Bubble = ({ id, x, onComplete }: BubbleProps) => {
  const controls = useAnimation()
  const size = useMemo(() => Math.random() * 60 + 40, [])
  const lifespan = useMemo(() => Math.random() * 3 + 6, [])
  const [exploding, setExploding] = useState(false)
  const [iconIndex] = useState(() => Math.floor(Math.random() * icons.length))
  const Icon = icons[iconIndex]
  const willExplode = useMemo(() => Math.random() < 0.45, [])
  const explodeTime = useMemo(() => 2 + Math.random() * 4, [])
  const targetY = '-200vh'

  useEffect(() => {
    controls.start({
      y: targetY,
      x: [`${x + Math.random() * 10 - 5}vw`, `${x + Math.random() * 10 - 5}vw`],
      opacity: [0.8, 1, 1, 0.8],
      scale: [1, 1.05, 1],
      transition: {
        y: { duration: willExplode ? explodeTime : 18, ease: 'linear' },
        x: { duration: willExplode ? explodeTime : 18, ease: 'easeInOut' },
        opacity: { duration: 8 },
        scale: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
      },
    })

    let timer: NodeJS.Timeout | undefined
    if (willExplode) {
      timer = setTimeout(() => setExploding(true), explodeTime * 1000)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [controls, x, willExplode, explodeTime, targetY])

  return (
    <motion.div
      className="absolute bottom-[-100px] z-0"
      style={{ left: `${x}vw`, width: size, height: size }}
      initial={{ y: 0, opacity: 0, scale: 0.8 }}
      animate={controls}
    >
      {!exploding ? (
        <div className="w-full h-full rounded-full bg-gradient-to-tr from-sky-400/50 to-blue-500/50 border-2 border-white/20 flex items-center justify-center shadow-lg backdrop-blur-sm">
          <Icon className="text-white" style={{ width: size / 2, height: size / 2 }} />
        </div>
      ) : (
        <BubbleExplosion onComplete={() => onComplete(id)} />
      )}
    </motion.div>
  )
}

export const WaveAnimation = () => {
  const [bubbles, setBubbles] = useState<Array<{ id: number; x: number }>>([])

  const addBubble = () => {
    if (bubbles.length >= 10) return
    const id = Date.now() + Math.random()
    const x = Math.random() * 100
    setBubbles((prev) => [...prev, { id, x }])
  }

  const removeBubble = (id: number) => {
    setBubbles((prev) => prev.filter((b) => b.id !== id))
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setBubbles((prev) => {
        if (prev.length >= 10) return prev
        const id = Date.now() + Math.random()
        const x = Math.random() * 100
        return [...prev, { id, x }]
      })
    }, 1500)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="absolute bottom-0 left-0 w-full h-40 overflow-visible pointer-events-none">
      {/* Bolle dietro la wave */}
      <div className="absolute bottom-0 left-0 w-full h-full z-0">
        {bubbles.map((b) => (
          <Bubble key={b.id} id={b.id} x={b.x} onComplete={removeBubble} />
        ))}
      </div>

      {/* Wave in primo piano */}
      <svg className="absolute bottom-[-30px] left-0 w-full z-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: 'rgb(56 189 248)', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'rgb(37 99 235)', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <motion.path
          fill="url(#waveGradient)"
          fillOpacity="0.7"
          d="M0,160L48,181.3C96,203,192,245,288,245.3C384,245,480,203,576,186.7C672,171,768,181,864,197.3C960,213,1056,235,1152,218.7C1248,203,1344,149,1392,122.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          animate={{
            d: [
              "M0,160L48,181.3C96,203,192,245,288,245.3C384,245,480,203,576,186.7C672,171,768,181,864,197.3C960,213,1056,235,1152,218.7C1248,203,1344,149,1392,122.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,192L48,176C96,160,192,128,288,138.7C384,149,480,203,576,224C672,245,768,235,864,208C960,181,1056,139,1152,144C1248,149,1344,203,1392,229.3L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, repeatType: 'mirror' as const, ease: 'easeInOut' }}
        />
      </svg>
    </div>
  )
}

