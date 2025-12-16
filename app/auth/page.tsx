"use client"

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useLanguage } from '@/components/providers/language-provider'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { X } from 'lucide-react'
import { Logo } from '@/components/logo'
import { LoginForm } from '@/components/auth/login-form'

type AuthMode = 'login' | 'register' | null

export default function AuthPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useLanguage()
  const [openModal, setOpenModal] = useState<AuthMode>(null)
  
  // Login state (deprecated - now using LoginForm component)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Register state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'DEFAULT' as 'DEFAULT' | 'ARTIST' | 'RECRUITER',
  })

  // Check for verification success message
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('verified') === 'true') {
      toast({
        title: t('toast.emailVerified'),
        description: t('toast.emailVerifiedDesc'),
      })
      setOpenModal('login')
    }
    if (params.get('error')) {
      const errorType = params.get('error')
      toast({
        title: t('toast.verifyError'),
        description: errorType === 'invalid-token' 
          ? t('toast.invalidToken')
          : errorType === 'expired-token'
          ? t('toast.expiredToken')
          : t('toast.verifyGenericError'),
        variant: 'destructive',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t])

  // handleLogin is now handled by LoginForm component

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: t('toast.validationError'),
        description: t('toast.passwordMismatch'),
        variant: 'destructive',
      })
      return
    }

    if (formData.password.length < 8) {
      toast({
        title: t('toast.validationError'),
        description: t('toast.passwordTooShort'),
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    toast({
      title: t('toast.registrationAttempt'),
      description: t('toast.registrationSending'),
      duration: 3000,
    })

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: t('toast.serverError'),
          description: `Status ${response.status}: ${data.error || t('toast.genericError')}`,
          variant: 'destructive',
        })
        throw new Error(data.error || t('toast.registrationError'))
      }

      toast({
        title: t('toast.registrationSuccess'),
        description: t('toast.checkEmail'),
      })

      setTimeout(() => {
        setOpenModal('login')
        setEmail(formData.email)
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'DEFAULT',
        })
      }, 2000)
    } catch (error: any) {
      toast({
        title: t('toast.genericError'),
        description: error.message || t('toast.genericError'),
        variant: 'destructive',
      })
      console.error('Registration error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-sky-400/20 to-blue-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        ></motion.div>
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-indigo-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        ></motion.div>
        <motion.div
          className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-gradient-to-r from-indigo-400/10 to-purple-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        ></motion.div>
      </div>

      {/* Header */}
      <header className="container mx-auto px-4 py-4 md:py-6 flex justify-between items-center relative z-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/" className="text-xl md:text-2xl font-black bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm hover:scale-105 transition-transform inline-block">
            Vybes
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 md:gap-4"
        >
          <LanguageToggle />
          <ThemeToggle />
        </motion.div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12 md:py-20 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Main Content Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative bg-gradient-to-br from-white/95 via-sky-50/50 to-blue-50/50 dark:from-gray-800/95 dark:via-sky-900/30 dark:to-blue-900/30 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border-2 border-sky-200/50 dark:border-sky-800/50 overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-sky-400/20 to-blue-500/20 rounded-full blur-3xl -z-0"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-400/20 to-indigo-500/20 rounded-full blur-3xl -z-0"></div>
            
            <div className="relative z-10 text-center space-y-8 md:space-y-12">
              {/* Logo Section */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <Logo />
                
                {/* Slogan */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-2xl md:text-3xl lg:text-4xl font-black tracking-wide px-4"
                >
                  <span className="text-slate-700 dark:text-slate-200">ARE </span>
                  <span className="text-blue-600 dark:text-blue-500">YOU</span>
                  <span className="text-slate-700 dark:text-slate-200"> READY TO MAKE SOME </span>
                  <span className="text-sky-500 dark:text-sky-400">NOISE</span>
                  <span className="text-slate-700 dark:text-slate-200">?</span>
                </motion.div>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="text-slate-600 dark:text-slate-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
                >
                  Unisciti alla community artistica più vibrante. Connetti artisti, recruiter e appassionati d&apos;arte in un&apos;unica piattaforma.
                </motion.p>
              </motion.div>

              {/* Feature Pills */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="flex flex-wrap justify-center gap-3 md:gap-4"
              >
                {[
                  { icon: '🎨', text: 'Portfolio' },
                  { icon: '🗺️', text: 'Mappa Eventi' },
                  { icon: '💬', text: 'Chat' },
                  { icon: '🏆', text: 'Gamification' },
                ].map((feature, index) => (
                  <motion.div
                    key={feature.text}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-2 border-sky-200/50 dark:border-sky-800/50 shadow-md hover:shadow-lg hover:scale-105 transition-all"
                  >
                    <span className="text-xl">{feature.icon}</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{feature.text}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
              >
                <Button
                  onClick={() => setOpenModal('login')}
                  size="lg"
                  className="w-full sm:w-auto text-base md:text-lg px-10 md:px-12 py-6 md:py-7 bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-600 hover:via-blue-600 hover:to-blue-700 shadow-xl shadow-sky-500/40 hover:shadow-2xl hover:shadow-sky-500/50 transition-all duration-300 hover:scale-110 font-black tracking-wide"
                >
                  Accedi
                </Button>
                <Button
                  onClick={() => setOpenModal('register')}
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto text-base md:text-lg px-10 md:px-12 py-6 md:py-7 border-2 border-sky-400 dark:border-sky-600 bg-gradient-to-r from-white/90 to-sky-50/50 dark:from-gray-800/90 dark:to-sky-900/30 backdrop-blur-sm hover:bg-sky-50/80 dark:hover:bg-sky-900/40 text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-black tracking-wide transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
                >
                  Registrati
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
          >
            {[
              { number: '1000+', label: 'Artisti' },
              { number: '500+', label: 'Eventi' },
              { number: '200+', label: 'Recruiter' },
              { number: '50+', label: 'Città' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 + index * 0.1, duration: 0.4 }}
                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 md:p-6 border-2 border-sky-200/50 dark:border-sky-800/50 shadow-lg hover:shadow-xl hover:scale-105 transition-all text-center"
              >
                <div className="text-2xl md:text-3xl font-black bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-sm md:text-base font-semibold text-slate-600 dark:text-slate-300 mt-1">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>

      {/* Backdrop */}
      <AnimatePresence>
        {openModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpenModal(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            
            {/* Login Modal */}
            {openModal === 'login' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative bg-gradient-to-br from-white/95 via-sky-50/50 to-blue-50/50 dark:from-gray-800/95 dark:via-sky-900/30 dark:to-blue-900/30 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-8 border-2 border-sky-200/50 dark:border-sky-800/50 max-w-md w-full max-h-[90vh] overflow-y-auto">
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sky-400/20 to-blue-500/20 rounded-full blur-3xl -z-0"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/20 to-indigo-500/20 rounded-full blur-3xl -z-0"></div>
                  
                  <button
                    onClick={() => setOpenModal(null)}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-sky-200 dark:border-sky-800 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:scale-110 transition-all duration-200 z-10 shadow-sm"
                  >
                    <X size={18} />
                  </button>

                  <motion.h2
                    className="text-2xl md:text-3xl font-black bg-gradient-to-r from-slate-800 via-sky-600 to-blue-600 dark:from-slate-100 dark:via-sky-400 dark:to-blue-400 bg-clip-text text-transparent mb-2 text-center relative z-10"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Entra su Vybes
                  </motion.h2>
                  <motion.p
                    className="text-slate-600 dark:text-slate-300 text-center mb-8 relative z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Gestisci account, notifiche, annunci e molto altro.
                  </motion.p>

                  <LoginForm onSuccess={() => setOpenModal(null)} />
                </div>
              </motion.div>
            )}

            {/* Register Modal */}
            {openModal === 'register' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative bg-gradient-to-br from-white/95 via-sky-50/50 to-blue-50/50 dark:from-gray-800/95 dark:via-sky-900/30 dark:to-blue-900/30 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-8 border-2 border-sky-200/50 dark:border-sky-800/50 max-w-md w-full max-h-[90vh] overflow-y-auto">
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sky-400/20 to-blue-500/20 rounded-full blur-3xl -z-0"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/20 to-indigo-500/20 rounded-full blur-3xl -z-0"></div>
                  
                  <button
                    onClick={() => setOpenModal(null)}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-sky-200 dark:border-sky-800 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:scale-110 transition-all duration-200 z-10 shadow-sm"
                  >
                    <X size={18} />
                  </button>

                  <motion.h2
                    className="text-2xl md:text-3xl font-black bg-gradient-to-r from-slate-800 via-sky-600 to-blue-600 dark:from-slate-100 dark:via-sky-400 dark:to-blue-400 bg-clip-text text-transparent mb-2 text-center relative z-10"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Crea il tuo account
                  </motion.h2>
                  <motion.p
                    className="text-slate-600 dark:text-slate-300 text-center mb-8 relative z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Unisciti alla community artistica
                  </motion.p>

                  <form onSubmit={handleRegister} className="space-y-6">
                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">
                        Nome
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Il tuo nome"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border-2 border-sky-200 dark:border-sky-800 focus:border-sky-500 dark:focus:border-sky-500 rounded-xl transition-all shadow-sm hover:shadow-md focus:shadow-lg focus:ring-2 focus:ring-sky-500/20 relative z-10"
                        required
                        disabled={loading}
                      />
                    </motion.div>

                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.45 }}
                    >
                      <Label htmlFor="reg-email" className="text-slate-700 dark:text-slate-300">
                        E-mail
                      </Label>
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="nome@esempio.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border-2 border-sky-200 dark:border-sky-800 focus:border-sky-500 dark:focus:border-sky-500 rounded-xl transition-all shadow-sm hover:shadow-md focus:shadow-lg focus:ring-2 focus:ring-sky-500/20 relative z-10"
                        required
                        disabled={loading}
                      />
                    </motion.div>

                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Label htmlFor="role" className="text-slate-700 dark:text-slate-300">
                        Ruolo
                      </Label>
                      <select
                        id="role"
                        className="flex h-10 w-full rounded-xl border-2 border-sky-200 dark:border-sky-800 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/20 focus-visible:border-sky-500 transition-all shadow-sm hover:shadow-md focus:shadow-lg relative z-10"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                        required
                        disabled={loading}
                      >
                        <option value="DEFAULT">Visualizzatore</option>
                        <option value="ARTIST">Artista</option>
                        <option value="RECRUITER">Recruiter</option>
                      </select>
                    </motion.div>

                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.55 }}
                    >
                      <Label htmlFor="reg-password" className="text-slate-700 dark:text-slate-300">
                        Password
                      </Label>
                      <Input
                        id="reg-password"
                        type="password"
                        placeholder="Inserisci la tua password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border-2 border-sky-200 dark:border-sky-800 focus:border-sky-500 dark:focus:border-sky-500 rounded-xl transition-all shadow-sm hover:shadow-md focus:shadow-lg focus:ring-2 focus:ring-sky-500/20 relative z-10"
                        required
                        disabled={loading}
                      />
                    </motion.div>

                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-slate-300">
                        Conferma Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Conferma la tua password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border-2 border-sky-200 dark:border-sky-800 focus:border-sky-500 dark:focus:border-sky-500 rounded-xl transition-all shadow-sm hover:shadow-md focus:shadow-lg focus:ring-2 focus:ring-sky-500/20 relative z-10"
                        required
                        disabled={loading}
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.65 }}
                    >
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-600 hover:via-blue-600 hover:to-blue-700 text-white font-bold py-3 shadow-xl shadow-sky-500/40 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-sky-500/50 relative z-10"
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="inline-block"
                            >
                              ⏳
                            </motion.span>
                            Registrazione in corso...
                          </span>
                        ) : (
                          'REGISTRATI'
                        )}
                      </Button>
                    </motion.div>

                    <div className="border-t border-sky-200 dark:border-sky-800 my-4"></div>

                    <motion.div
                      className="text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      <p className="text-slate-600 dark:text-slate-400 mb-2">
                        Hai già un account?
                      </p>
                      <Button
                        type="button"
                        onClick={() => setOpenModal('login')}
                        variant="outline"
                        className="w-full border-2 border-sky-400 dark:border-sky-600 bg-gradient-to-r from-sky-50/80 to-blue-50/80 dark:from-sky-900/40 dark:to-blue-900/40 backdrop-blur-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 hover:border-sky-500 dark:hover:border-sky-500 font-bold py-3 shadow-md hover:shadow-lg transition-all hover:scale-105 relative z-10"
                        disabled={loading}
                      >
                        ACCEDI
                      </Button>
                    </motion.div>
                  </form>
                </div>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
