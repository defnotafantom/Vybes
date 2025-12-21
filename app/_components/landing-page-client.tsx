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
  Shield,
  Smartphone
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-white/40 dark:border-gray-700/40 shadow-lg shadow-black/5 dark:shadow-black/20"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white font-semibold shadow-md">
          {avatar}
        </div>
        <div>
          <div className="font-medium text-gray-900 dark:text-white text-sm">{name}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{role}</div>
        </div>
      </div>
      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{text}</p>
      <div className="flex mt-4 gap-0.5">
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      className="flex gap-4 items-start p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center text-sky-600 dark:text-sky-400 font-semibold">
        {number}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h4>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{description}</p>
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
      color: 'from-sky-400 to-blue-500',
    },
    {
      icon: Calendar,
      title: language === 'it' ? 'Eventi' : 'Events',
      description: language === 'it' 
        ? 'Scopri e partecipa a eventi culturali esclusivi' 
        : 'Discover and join exclusive cultural events',
      color: 'from-violet-400 to-purple-500',
    },
    {
      icon: Palette,
      title: language === 'it' ? 'Portfolio' : 'Portfolio',
      description: language === 'it' 
        ? 'Mostra il tuo talento con un portfolio professionale' 
        : 'Showcase your talent with a professional portfolio',
      color: 'from-orange-400 to-rose-500',
    },
    {
      icon: Zap,
      title: language === 'it' ? 'Opportunità' : 'Opportunities',
      description: language === 'it' 
        ? 'Trova collaborazioni, lavori e nuove esperienze' 
        : 'Find collaborations, jobs and new experiences',
      color: 'from-emerald-400 to-teal-500',
    },
    {
      icon: MessageCircle,
      title: language === 'it' ? 'Chat' : 'Chat',
      description: language === 'it' 
        ? 'Comunica in tempo reale con altri artisti' 
        : 'Communicate in real-time with other artists',
      color: 'from-cyan-400 to-sky-500',
    },
    {
      icon: MapPin,
      title: language === 'it' ? 'Mappa' : 'Map',
      description: language === 'it' 
        ? 'Esplora eventi e artisti sulla mappa interattiva' 
        : 'Explore events and artists on the interactive map',
      color: 'from-pink-400 to-rose-500',
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
    <div className="min-h-screen bg-gradient-to-b from-white via-sky-50/30 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 relative overflow-x-hidden">
      
      {/* Header - Glass Effect */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="mx-4 mt-4">
          <div className="container mx-auto px-4 py-3 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-lg shadow-black/5 dark:shadow-black/20">
            <div className="flex justify-between items-center">
              {/* Logo Section */}
              <Link href="/" className="flex items-center gap-2.5 group select-none" aria-label="Vybes">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 grid place-items-center shadow-md shadow-sky-500/20"
                >
                  <span className="text-white font-black text-xl">V</span>
                </motion.div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  Vybes
                </span>
              </Link>

              {/* Right Section */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 p-1 bg-gray-100/80 dark:bg-gray-800/80 rounded-xl">
                  <LanguageToggle />
                  <ThemeToggle />
                </div>
                <Button 
                  asChild 
                  size="sm" 
                  className="hidden sm:flex bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-all duration-300 rounded-xl px-5"
                >
                  <Link href="/auth">
                    {language === 'it' ? 'Inizia' : 'Start'}
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full text-gray-600 dark:text-gray-300 text-sm font-medium mb-6 border border-white/40 dark:border-gray-700/40 shadow-sm"
            >
              <Sparkles className="h-4 w-4 text-sky-500" />
              {language === 'it' ? 'La community #1 per artisti' : '#1 community for artists'}
            </motion.div>

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight"
            >
              <span className="text-gray-900 dark:text-white">
                {language === 'it' ? 'Dove la ' : 'Where '}
              </span>
              <span className="text-sky-500">
                {language === 'it' ? 'creatività' : 'creativity'}
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">
                {language === 'it' ? 'incontra le ' : 'meets '}
              </span>
              <span className="text-sky-500">
                {language === 'it' ? 'opportunità' : 'opportunity'}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10"
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
              className="flex flex-col sm:flex-row justify-center gap-4 mb-10"
            >
              <Button
                asChild
                size="lg"
                className="text-base px-8 py-6 bg-sky-500 hover:bg-sky-600 transition-colors font-semibold rounded-xl"
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
                className="text-base px-8 py-6 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
              >
                <Link href="#features">
                  {language === 'it' ? 'Scopri di più' : 'Learn more'}
                </Link>
              </Button>
            </motion.div>

            {/* Categories Pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex flex-wrap justify-center gap-2"
            >
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-full border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                >
                  <cat.icon className="h-4 w-4 text-sky-500" />
                  {cat.label}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                  {isVisible && <Counter end={stat.value} />}{stat.suffix}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative z-10 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {language === 'it' ? 'Tutto ciò di cui hai bisogno' : 'Everything you need'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              {language === 'it' 
                ? 'Strumenti potenti per artisti e recruiter in un\'unica piattaforma'
                : 'Powerful tools for artists and recruiters in one platform'}
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                whileHover={{ y: -4 }}
                className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-white/40 dark:border-gray-700/40 shadow-lg shadow-black/5 dark:shadow-black/20 hover:shadow-xl transition-shadow"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-md`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {language === 'it' ? 'Inizia in 4 semplici passi' : 'Start in 4 simple steps'}
            </h2>
          </motion.div>

          <div className="max-w-2xl mx-auto space-y-6">
            {howItWorks.map((step, i) => (
              <HowItWorksStep
                key={step.title}
                number={i + 1}
                icon={step.icon}
                title={step.title}
                description={step.description}
                delay={i * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 relative z-10 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {language === 'it' ? 'Cosa dicono di noi' : 'What they say about us'}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {testimonials.map((testimonial, i) => (
              <TestimonialCard
                key={testimonial.name}
                {...testimonial}
                delay={i * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            {[
              { icon: Shield, text: language === 'it' ? 'Sicuro' : 'Secure' },
              { icon: CheckCircle2, text: language === 'it' ? 'Gratuito' : 'Free' },
              { icon: Globe, text: language === 'it' ? 'Multilingua' : 'Multilingual' },
              { icon: Smartphone, text: language === 'it' ? 'Mobile' : 'Mobile' },
              { icon: Zap, text: language === 'it' ? 'Veloce' : 'Fast' },
            ].map((badge) => (
              <div
                key={badge.text}
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400"
              >
                <badge.icon className="h-4 w-4" />
                <span className="text-sm">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {language === 'it' ? 'Pronto a iniziare?' : 'Ready to start?'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              {language === 'it' 
                ? 'Unisciti a migliaia di artisti e recruiter. È gratuito, per sempre.'
                : 'Join thousands of artists and recruiters. It\'s free, forever.'}
            </p>
            <Button
              asChild
              size="lg"
              className="px-8 py-6 bg-sky-500 hover:bg-sky-600 transition-colors font-semibold rounded-xl"
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
      <footer className="py-8 relative z-10 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            © {new Date().getFullYear()} Vybes. {language === 'it' ? 'Tutti i diritti riservati.' : 'All rights reserved.'}
          </p>
        </div>
      </footer>

      {/* Wave - positioned at very bottom, behind everything */}
      <div className="fixed bottom-0 left-0 w-full -z-10 pointer-events-none opacity-30 dark:opacity-20">
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


