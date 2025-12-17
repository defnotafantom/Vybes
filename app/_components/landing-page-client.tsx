"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { useLanguage } from '@/components/providers/language-provider'
import { Logo } from '@/components/logo'
import { WaveAnimation } from '@/components/landing/wave-animation'

export function LandingPageClient() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 relative overflow-hidden">
      {/* Header */}
      <header className="container mx-auto px-4 py-4 md:py-6 flex justify-between items-center relative z-20">
        <Link href="/" className="flex items-center gap-3 group select-none" aria-label="Vybes">
          <div className="h-10 w-10 rounded-2xl bg-white/70 dark:bg-gray-900/50 border border-sky-200/60 dark:border-sky-800/60 shadow-sm grid place-items-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://i.imgur.com/gGwB8VE.png"
              alt="Vybes"
              className="h-8 w-8 object-contain drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
            />
          </div>
          <div className="leading-tight">
            <div className="text-lg md:text-xl font-black bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
              Vybes
            </div>
            <div className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 tracking-wide">
              {t('landing.hero.subtitle')}
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-2 md:gap-4">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-4 py-12 md:py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 md:space-y-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="space-y-4 md:space-y-6"
          >
            <Logo />

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl md:text-2xl lg:text-3xl font-bold tracking-wide px-4"
            >
              <span className="text-slate-700 dark:text-slate-200">{t('landing.hero.slogan.are')} </span>
              <span className="text-blue-600 dark:text-blue-500">{t('landing.hero.slogan.you')}</span>
              <span className="text-slate-700 dark:text-slate-200"> {t('landing.hero.slogan.readyToMakeSome')} </span>
              <span className="text-sky-500 dark:text-sky-400">{t('landing.hero.slogan.noise')}</span>
              <span className="text-slate-700 dark:text-slate-200">?</span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex justify-center pt-4"
          >
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto text-base md:text-lg px-8 md:px-10 py-6 md:py-7 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-xl shadow-sky-500/30 hover:shadow-2xl hover:shadow-sky-500/40 transition-all duration-300 hover:scale-105 font-bold tracking-wide"
            >
              <Link href="/auth">{t('landing.hero.cta.letsGo')}</Link>
            </Button>
          </motion.div>
        </div>
      </main>

      {/* Wave */}
      <div className="fixed bottom-0 left-0 w-full z-0">
        <WaveAnimation />
      </div>
    </div>
  )
}


