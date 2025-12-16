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
        animate={{ y: [0, -30, 0] }}
        whileHover={{ 
          rotate: 360,
        }}
        transition={{ 
          duration: 5,  
          ease: 'easeIn', 
          y: { duration: 3, repeat: Infinity }
        }}
      >
        <Image
          className="w-40 h-40 md:w-52 md:h-52 lg:w-64 lg:h-64 object-contain drop-shadow-2xl"
          alt="Vybes logo - abstract artistic design"
          src="https://i.imgur.com/gGwB8VE.png"
          width={256}
          height={256}
        />
      </motion.div>

      <div className="text-center space-y-1 relative z-20">
        <h1 
          className="text-6xl md:text-5xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-600 tracking-tight leading-[1.15] mb-2"
          style={{ fontSize: '4rem', lineHeight: '1', paddingBottom: '0.2em' }}
        >
          Vybes
        </h1>
        <p 
          className="text-sm md:text-base font-semibold text-slate-600 tracking-widest uppercase relative z-10"
          style={{ lineHeight: '0', paddingTop: '0.01em' }}
        >
          Bridging Culture & Opportunity
        </p>
      </div>
    </motion.div>
  )
}

