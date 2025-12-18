"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { useLanguage } from '@/components/providers/language-provider'
import { Logo } from '@/components/logo'
import { WaveAnimation } from '@/components/landing/wave-animation'
import { 
  Music, 
  Palette, 
  Camera, 
  Users, 
  Calendar, 
  Star,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Globe,
  Zap
} from 'lucide-react'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export function LandingPageClient() {
  const { t, language } = useLanguage()

  const features = [
    {
      icon: Users,
      title: language === 'it' ? 'Connetti' : 'Connect',
      description: language === 'it' 
        ? 'Trova artisti e recruiter nella tua area' 
        : 'Find artists and recruiters in your area',
      color: 'from-sky-500 to-blue-500',
    },
    {
      icon: Calendar,
      title: language === 'it' ? 'Eventi' : 'Events',
      description: language === 'it' 
        ? 'Scopri e partecipa a eventi culturali' 
        : 'Discover and join cultural events',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Palette,
      title: language === 'it' ? 'Portfolio' : 'Portfolio',
      description: language === 'it' 
        ? 'Mostra il tuo talento al mondo' 
        : 'Showcase your talent to the world',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Zap,
      title: language === 'it' ? 'Opportunità' : 'Opportunities',
      description: language === 'it' 
        ? 'Trova collaborazioni e lavori' 
        : 'Find collaborations and jobs',
      color: 'from-green-500 to-emerald-500',
    },
  ]

  const stats = [
    { value: '1000+', label: language === 'it' ? 'Artisti' : 'Artists' },
    { value: '500+', label: language === 'it' ? 'Eventi' : 'Events' },
    { value: '50+', label: language === 'it' ? 'Città' : 'Cities' },
  ]

  const categories = [
    { icon: Music, label: language === 'it' ? 'Musica' : 'Music' },
    { icon: Palette, label: language === 'it' ? 'Arte' : 'Art' },
    { icon: Camera, label: language === 'it' ? 'Fotografia' : 'Photography' },
    { icon: Star, label: language === 'it' ? 'Teatro' : 'Theater' },
  ]

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
      <main className="relative z-10">
        <section className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-4xl mx-auto text-center space-y-8">
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

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-slate-600 dark:text-slate-300 text-base md:text-lg max-w-2xl mx-auto"
              >
                {language === 'it' 
                  ? 'La piattaforma che connette artisti, recruiter e appassionati di cultura. Crea il tuo profilo, scopri eventi e trova nuove opportunità.'
                  : 'The platform that connects artists, recruiters and culture enthusiasts. Create your profile, discover events and find new opportunities.'}
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-col sm:flex-row justify-center gap-4 pt-4"
            >
              <Button
                asChild
                size="lg"
                className="text-base md:text-lg px-8 md:px-10 py-6 md:py-7 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-xl shadow-sky-500/30 hover:shadow-2xl hover:shadow-sky-500/40 transition-all duration-300 hover:scale-105 font-bold tracking-wide"
              >
                <Link href="/auth">
                  {t('landing.hero.cta.letsGo')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-base md:text-lg px-8 py-6 border-2 border-sky-300 dark:border-sky-700 hover:bg-sky-50 dark:hover:bg-sky-900/30"
              >
                <Link href="/auth">
                  {language === 'it' ? 'Scopri di più' : 'Learn more'}
                </Link>
              </Button>
            </motion.div>

            {/* Categories pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex flex-wrap justify-center gap-3 pt-6"
            >
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + i * 0.1 }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full border border-sky-200/50 dark:border-sky-800/50 text-sm text-slate-700 dark:text-slate-300"
                >
                  <cat.icon className="h-4 w-4 text-sky-500" />
                  {cat.label}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4 py-12"
        >
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center p-4 md:p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-sky-200/50 dark:border-sky-800/50"
              >
                <div className="text-2xl md:text-4xl font-black bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-slate-600 dark:text-slate-400 mt-1">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="container mx-auto px-4 py-12 pb-32"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-2xl md:text-3xl font-bold text-center mb-8 text-slate-800 dark:text-slate-100"
          >
            <Sparkles className="inline-block h-6 w-6 mr-2 text-sky-500" />
            {language === 'it' ? 'Perché Vybes?' : 'Why Vybes?'}
          </motion.h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-sky-200/50 dark:border-sky-800/50 hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Trust badges */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-wrap justify-center gap-6 mt-12"
          >
            {[
              { icon: CheckCircle2, text: language === 'it' ? 'Gratuito' : 'Free' },
              { icon: Globe, text: language === 'it' ? 'Multilingua' : 'Multilingual' },
              { icon: Zap, text: language === 'it' ? 'Veloce' : 'Fast' },
            ].map((badge) => (
              <div key={badge.text} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <badge.icon className="h-4 w-4 text-green-500" />
                {badge.text}
              </div>
            ))}
          </motion.div>
        </motion.section>
      </main>

      {/* Wave */}
      <div className="fixed bottom-0 left-0 w-full z-0">
        <WaveAnimation />
      </div>
    </div>
  )
}





