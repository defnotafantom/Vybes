"use client"

import { motion } from 'framer-motion'
import Image from 'next/image'

export function Logo() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center space-y-7"
    >
      <motion.div
        className="relative"
        animate={{ y: [0, -14, 0] }}
        whileHover={{ scale: 1.03, rotate: 2 }}
        transition={{
          y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
          scale: { duration: 0.2 },
          rotate: { duration: 0.2 },
        }}
      >
        <Image
          className="w-36 h-36 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 object-contain drop-shadow-2xl"
          alt="Vybes logo - abstract artistic design"
          src="https://i.imgur.com/gGwB8VE.png"
          width={256}
          height={256}
        />
      </motion.div>

      <div className="text-center space-y-1 relative z-20">
        <h1 
          className="text-5xl sm:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-600 tracking-tight leading-none"
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

