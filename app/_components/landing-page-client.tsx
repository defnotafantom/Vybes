"use client"

import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { useLanguage } from '@/components/providers/language-provider'
import { Logo } from '@/components/logo'
import { WaveAnimation } from '@/components/landing/wave-animation'
import { useState, useEffect } from 'react'
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
  Zap,
  Heart,
  MessageCircle,
  MapPin,
  TrendingUp,
  Shield,
  Smartphone,
  Play,
  ChevronDown
} from 'lucide-react'

// Animated counter hook
function useCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    let startTime: number
    let animationFrame: number
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }
    
    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration])
  
  return count
}

// Floating particles component
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-sky-400/20 dark:bg-sky-400/10 rounded-full"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
          }}
          animate={{
            y: [null, Math.random() * -200 - 100],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  )
}

// Testimonial card component
function TestimonialCard({ name, role, text, avatar, delay }: {
  name: string
  role: string
  text: string
  avatar: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-sky-200/50 dark:border-sky-800/50 shadow-xl"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
          {avatar}
        </div>
        <div>
          <div className="font-semibold text-slate-800 dark:text-slate-100">{name}</div>
          <div className="text-sm text-sky-600 dark:text-sky-400">{role}</div>
        </div>
      </div>
      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{text}</p>
      <div className="flex mt-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
        ))}
      </div>
    </motion.div>
  )
}

// How it works step
function HowItWorksStep({ number, title, description, icon: Icon, delay }: {
  number: number
  title: string
  description: string
  icon: any
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="flex gap-4 items-start"
    >
      <div className="relative">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
          <Icon className="h-7 w-7 text-white" />
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white dark:bg-gray-900 border-2 border-sky-500 flex items-center justify-center text-xs font-bold text-sky-600">
          {number}
        </div>
      </div>
      <div className="flex-1 pt-1">
        <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-1">{title}</h4>
        <p className="text-slate-600 dark:text-slate-400 text-sm">{description}</p>
      </div>
    </motion.div>
  )
}

export function LandingPageClient() {
  const { t, language } = useLanguage()
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])
  
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    setIsVisible(true)
  }, [])

  const features = [
    {
      icon: Users,
      title: language === 'it' ? 'Connetti' : 'Connect',
      description: language === 'it' 
        ? 'Trova artisti e recruiter nella tua area e inizia a collaborare' 
        : 'Find artists and recruiters in your area and start collaborating',
      color: 'from-sky-500 to-blue-500',
    },
    {
      icon: Calendar,
      title: language === 'it' ? 'Eventi' : 'Events',
      description: language === 'it' 
        ? 'Scopri e partecipa a eventi culturali esclusivi' 
        : 'Discover and join exclusive cultural events',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Palette,
      title: language === 'it' ? 'Portfolio' : 'Portfolio',
      description: language === 'it' 
        ? 'Mostra il tuo talento con un portfolio professionale' 
        : 'Showcase your talent with a professional portfolio',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Zap,
      title: language === 'it' ? 'Opportunità' : 'Opportunities',
      description: language === 'it' 
        ? 'Trova collaborazioni, lavori e nuove esperienze' 
        : 'Find collaborations, jobs and new experiences',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: MessageCircle,
      title: language === 'it' ? 'Chat' : 'Chat',
      description: language === 'it' 
        ? 'Comunica in tempo reale con altri artisti' 
        : 'Communicate in real-time with other artists',
      color: 'from-cyan-500 to-teal-500',
    },
    {
      icon: MapPin,
      title: language === 'it' ? 'Mappa' : 'Map',
      description: language === 'it' 
        ? 'Esplora eventi e artisti sulla mappa interattiva' 
        : 'Explore events and artists on the interactive map',
      color: 'from-rose-500 to-pink-500',
    },
  ]

  const stats = [
    { value: 1000, label: language === 'it' ? 'Artisti' : 'Artists', suffix: '+' },
    { value: 500, label: language === 'it' ? 'Eventi' : 'Events', suffix: '+' },
    { value: 50, label: language === 'it' ? 'Città' : 'Cities', suffix: '+' },
    { value: 98, label: language === 'it' ? 'Soddisfazione' : 'Satisfaction', suffix: '%' },
  ]

  const categories = [
    { icon: Music, label: language === 'it' ? 'Musica' : 'Music', color: 'bg-purple-500' },
    { icon: Palette, label: language === 'it' ? 'Arte' : 'Art', color: 'bg-orange-500' },
    { icon: Camera, label: language === 'it' ? 'Fotografia' : 'Photography', color: 'bg-pink-500' },
    { icon: Star, label: language === 'it' ? 'Teatro' : 'Theater', color: 'bg-yellow-500' },
    { icon: Users, label: language === 'it' ? 'Danza' : 'Dance', color: 'bg-green-500' },
    { icon: Heart, label: language === 'it' ? 'Moda' : 'Fashion', color: 'bg-red-500' },
  ]

  const testimonials = language === 'it' ? [
    { name: 'Marco R.', role: 'Musicista', text: 'Vybes mi ha permesso di trovare collaborazioni incredibili. In 3 mesi ho partecipato a 5 eventi!', avatar: 'M' },
    { name: 'Sara L.', role: 'Fotografa', text: 'La community è fantastica. Ho trovato il mio stile grazie ai feedback degli altri artisti.', avatar: 'S' },
    { name: 'Luca B.', role: 'Recruiter', text: 'Strumento essenziale per trovare talenti. La ricerca per località è geniale.', avatar: 'L' },
  ] : [
    { name: 'Marco R.', role: 'Musician', text: 'Vybes allowed me to find incredible collaborations. In 3 months I participated in 5 events!', avatar: 'M' },
    { name: 'Sara L.', role: 'Photographer', text: 'The community is amazing. I found my style thanks to feedback from other artists.', avatar: 'S' },
    { name: 'Luca B.', role: 'Recruiter', text: 'Essential tool for finding talent. Location search is brilliant.', avatar: 'L' },
  ]

  const howItWorks = language === 'it' ? [
    { icon: Users, title: 'Crea il profilo', description: 'Registrati e personalizza il tuo profilo artistico' },
    { icon: Palette, title: 'Mostra il talento', description: 'Carica le tue opere nel portfolio' },
    { icon: MapPin, title: 'Esplora', description: 'Trova eventi e artisti nella tua zona' },
    { icon: Zap, title: 'Connetti', description: 'Inizia a collaborare e cresci insieme' },
  ] : [
    { icon: Users, title: 'Create profile', description: 'Sign up and customize your artistic profile' },
    { icon: Palette, title: 'Show talent', description: 'Upload your works to the portfolio' },
    { icon: MapPin, title: 'Explore', description: 'Find events and artists in your area' },
    { icon: Zap, title: 'Connect', description: 'Start collaborating and grow together' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/50 dark:to-indigo-900 relative overflow-x-hidden">
      <FloatingParticles />
      
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-sky-200/50 dark:border-sky-800/50"
      >
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group select-none" aria-label="Vybes">
            <motion.div 
              whileHover={{ rotate: 10 }}
              className="h-10 w-10 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-sky-500/30 grid place-items-center overflow-hidden"
            >
              <img
                src="https://i.imgur.com/gGwB8VE.png"
                alt="Vybes"
                className="h-7 w-7 object-contain"
              />
            </motion.div>
            <div className="leading-tight">
              <div className="text-lg font-black bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                Vybes
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <Button asChild size="sm" className="hidden sm:flex bg-gradient-to-r from-sky-500 to-blue-600 shadow-lg shadow-sky-500/30">
              <Link href="/auth">
                {language === 'it' ? 'Inizia' : 'Start'}
              </Link>
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section 
        style={{ opacity, scale }}
        className="relative pt-24 pb-16 md:pt-32 md:pb-24"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <Logo />
            </motion.div>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-sky-100 dark:bg-sky-900/50 rounded-full text-sky-700 dark:text-sky-300 text-sm font-medium mb-6"
            >
              <Sparkles className="h-4 w-4" />
              {language === 'it' ? 'La community #1 per artisti' : '#1 community for artists'}
            </motion.div>

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-3xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight"
            >
              <span className="text-slate-800 dark:text-white">
                {language === 'it' ? 'Dove la ' : 'Where '}
              </span>
              <span className="bg-gradient-to-r from-sky-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                {language === 'it' ? 'creatività' : 'creativity'}
              </span>
              <br />
              <span className="text-slate-800 dark:text-white">
                {language === 'it' ? 'incontra le ' : 'meets '}
              </span>
              <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 bg-clip-text text-transparent">
                {language === 'it' ? 'opportunità' : 'opportunity'}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8"
            >
              {language === 'it' 
                ? 'Connetti con artisti, scopri eventi esclusivi e fai crescere la tua carriera creativa. Tutto in un unico posto.'
                : 'Connect with artists, discover exclusive events and grow your creative career. All in one place.'}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-col sm:flex-row justify-center gap-4 mb-8"
            >
              <Button
                asChild
                size="lg"
                className="text-lg px-10 py-7 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-2xl shadow-sky-500/40 hover:shadow-sky-500/50 transition-all duration-300 hover:scale-105 font-bold rounded-2xl"
              >
                <Link href="/auth">
                  {language === 'it' ? 'Inizia gratis' : 'Start free'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-lg px-10 py-7 border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl"
              >
                <Link href="#features">
                  <Play className="mr-2 h-5 w-5" />
                  {language === 'it' ? 'Scopri come funziona' : 'See how it works'}
                </Link>
              </Button>
            </motion.div>

            {/* Categories Pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex flex-wrap justify-center gap-3"
            >
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.05 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                >
                  <div className={`w-6 h-6 rounded-full ${cat.color} flex items-center justify-center`}>
                    <cat.icon className="h-3 w-3 text-white" />
                  </div>
                  {cat.label}
                </motion.div>
              ))}
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-12"
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="flex flex-col items-center text-slate-400"
              >
                <span className="text-xs mb-2">{language === 'it' ? 'Scorri per scoprire' : 'Scroll to discover'}</span>
                <ChevronDown className="h-5 w-5" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-sky-200/50 dark:border-sky-800/50 shadow-xl"
              >
                <div className="text-3xl md:text-5xl font-black bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                  {isVisible && <Counter end={stat.value} />}{stat.suffix}
                </div>
                <div className="text-sm md:text-base text-slate-600 dark:text-slate-400 mt-2 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1 bg-sky-100 dark:bg-sky-900/50 rounded-full text-sky-700 dark:text-sky-300 text-sm font-medium mb-4">
              {language === 'it' ? 'Funzionalità' : 'Features'}
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-white mb-4">
              {language === 'it' ? 'Tutto ciò di cui hai bisogno' : 'Everything you need'}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              {language === 'it' 
                ? 'Strumenti potenti per artisti e recruiter in un\'unica piattaforma'
                : 'Powerful tools for artists and recruiters in one platform'}
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gradient-to-b from-transparent via-sky-50/50 to-transparent dark:via-sky-900/10 relative z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1 bg-purple-100 dark:bg-purple-900/50 rounded-full text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
              {language === 'it' ? 'Come funziona' : 'How it works'}
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-white mb-4">
              {language === 'it' ? 'Inizia in 4 semplici passi' : 'Start in 4 simple steps'}
            </h2>
          </motion.div>

          <div className="max-w-2xl mx-auto space-y-8">
            {howItWorks.map((step, i) => (
              <HowItWorksStep
                key={step.title}
                number={i + 1}
                icon={step.icon}
                title={step.title}
                description={step.description}
                delay={i * 0.15}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1 bg-pink-100 dark:bg-pink-900/50 rounded-full text-pink-700 dark:text-pink-300 text-sm font-medium mb-4">
              {language === 'it' ? 'Testimonianze' : 'Testimonials'}
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-white mb-4">
              {language === 'it' ? 'Cosa dicono di noi' : 'What they say about us'}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, i) => (
              <TestimonialCard
                key={testimonial.name}
                {...testimonial}
                delay={i * 0.15}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="py-12 relative z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-8"
          >
            {[
              { icon: Shield, text: language === 'it' ? 'Sicuro' : 'Secure' },
              { icon: CheckCircle2, text: language === 'it' ? 'Gratuito' : 'Free' },
              { icon: Globe, text: language === 'it' ? 'Multilingua' : 'Multilingual' },
              { icon: Smartphone, text: language === 'it' ? 'Mobile Ready' : 'Mobile Ready' },
              { icon: Zap, text: language === 'it' ? 'Veloce' : 'Fast' },
            ].map((badge, i) => (
              <motion.div
                key={badge.text}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-2 text-slate-600 dark:text-slate-400"
              >
                <badge.icon className="h-5 w-5 text-green-500" />
                <span className="font-medium">{badge.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center p-12 bg-gradient-to-r from-sky-500 to-blue-600 rounded-[2.5rem] shadow-2xl shadow-sky-500/30"
          >
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
              {language === 'it' ? 'Pronto a iniziare?' : 'Ready to start?'}
            </h2>
            <p className="text-sky-100 text-lg mb-8 max-w-xl mx-auto">
              {language === 'it' 
                ? 'Unisciti a migliaia di artisti e recruiter. È gratuito, per sempre.'
                : 'Join thousands of artists and recruiters. It\'s free, forever.'}
            </p>
            <Button
              asChild
              size="lg"
              className="text-lg px-12 py-7 bg-white text-sky-600 hover:bg-sky-50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 font-bold rounded-2xl"
            >
              <Link href="/auth">
                {language === 'it' ? 'Crea il tuo account' : 'Create your account'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 relative z-10 border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            © {new Date().getFullYear()} Vybes. {language === 'it' ? 'Tutti i diritti riservati.' : 'All rights reserved.'}
          </p>
        </div>
      </footer>

      {/* Wave */}
      <div className="fixed bottom-0 left-0 w-full z-0 pointer-events-none">
        <WaveAnimation />
      </div>
    </div>
  )
}

// Counter component
function Counter({ end }: { end: number }) {
  const count = useCounter(end, 2000)
  return <>{count}</>
}
