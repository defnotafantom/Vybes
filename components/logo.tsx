"use client"

import { motion, useAnimation } from 'framer-motion'
import Image from 'next/image'
import { useState } from 'react'

export function Logo() {
  const controls = useAnimation()
  const [isHovered, setIsHovered] = useState(false)

  const handleHoverStart = () => {
    setIsHovered(true)
    controls.start({
      rotate: 360,
      scale: 1.08,
      transition: {
        rotate: {
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        },
        scale: {
          duration: 0.4,
          ease: 'easeOut',
        },
      },
    })
  }

  const handleHoverEnd = () => {
    setIsHovered(false)
    controls.start({
      rotate: -360,
      scale: 1,
      transition: {
        rotate: {
          duration: 1.5,
          ease: 'easeOut',
        },
        scale: {
          duration: 0.4,
          ease: 'easeOut',
        },
      },
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center space-y-7"
    >
      <motion.div
        className="relative cursor-pointer"
        animate={{ y: [0, -14, 0] }}
        transition={{
          y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
        }}
        onHoverStart={handleHoverStart}
        onHoverEnd={handleHoverEnd}
      >
        <motion.div
          animate={controls}
          initial={{ rotate: 0, scale: 1 }}
        >
          <Image
            className="w-36 h-36 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 object-contain drop-shadow-2xl"
            alt="Vybes logo - abstract artistic design"
            src="https://i.imgur.com/gGwB8VE.png"
            width={256}
            height={256}
          />
        </motion.div>
        {/* Glow effect on hover */}
        <motion.div
          className="absolute inset-0 rounded-full bg-sky-500/20 blur-3xl -z-10"
          animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1.2 : 0.8 }}
          transition={{ duration: 0.4 }}
        />
      </motion.div>

      <div className="text-center space-y-1 relative z-20 -mt-2">
        <h1 
          className="text-5xl sm:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-600 tracking-tight leading-none pb-1"
        >
          Vybes
        </h1>
        <p 
          className="text-xs sm:text-sm md:text-base font-semibold text-slate-600 dark:text-slate-300 tracking-[0.22em] uppercase"
        >
          Bridging Culture & Opportunity
        </p>
      </div>
    </motion.div>
  )
}

