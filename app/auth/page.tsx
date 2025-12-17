"use client"

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Logo } from '@/components/logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useLanguage } from '@/components/providers/language-provider'
import { LoginForm } from '@/components/auth/login-form'

type AuthMode = 'login' | 'register'

export default function AuthPage() {
  const router = useRouter()
  const { status } = useSession()
  const { toast } = useToast()
  const { t } = useLanguage()

  const [mode, setMode] = useState<AuthMode>('login')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'DEFAULT' as 'DEFAULT' | 'ARTIST' | 'RECRUITER',
  })

  // Already logged in -> dashboard
  useEffect(() => {
    if (status === 'authenticated') router.replace('/dashboard')
  }, [status, router])

  // Verification / error toasts (from email links)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('verified') === 'true') {
      toast({ title: t('toast.emailVerified'), description: t('toast.emailVerifiedDesc') })
      setMode('login')
    }
    const errorType = params.get('error')
    if (errorType) {
      toast({
        title: t('toast.verifyError'),
        description:
          errorType === 'invalid-token'
            ? t('toast.invalidToken')
            : errorType === 'expired-token'
              ? t('toast.expiredToken')
              : t('toast.verifyGenericError'),
        variant: 'destructive',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t])

  const features = useMemo(
    () => [
      { icon: '🎨', text: t('auth.feature.portfolio') },
      { icon: '🗺️', text: t('auth.feature.map') },
      { icon: '💬', text: t('auth.feature.chat') },
      { icon: '🏆', text: t('auth.feature.gamification') },
    ],
    [t]
  )

  const stats = useMemo(
    () => [
      { number: '1000+', label: t('auth.stats.artists') },
      { number: '500+', label: t('auth.stats.events') },
      { number: '200+', label: t('auth.stats.recruiters') },
      { number: '50+', label: t('auth.stats.cities') },
    ],
    [t]
  )

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast({ title: t('toast.validationError'), description: t('toast.passwordMismatch'), variant: 'destructive' })
      return
    }
    if (formData.password.length < 8) {
      toast({ title: t('toast.validationError'), description: t('toast.passwordTooShort'), variant: 'destructive' })
      return
    }

    setLoading(true)
    toast({ title: t('toast.registrationAttempt'), description: t('toast.registrationSending'), duration: 3000 })

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

      toast({ title: t('toast.registrationSuccess'), description: t('toast.checkEmail') })
      setMode('login')
      setFormData({ name: '', email: '', password: '', confirmPassword: '', role: 'DEFAULT' })
    } catch (error: any) {
      toast({ title: t('toast.genericError'), description: error.message || t('toast.genericError'), variant: 'destructive' })
      console.error('Registration error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-sky-400/20 to-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-gradient-to-r from-indigo-400/10 to-purple-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {/* Header */}
      <header className="container mx-auto px-4 py-4 md:py-6 flex justify-between items-center relative z-20">
        <Link href="/" className="text-xl md:text-2xl font-black bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm hover:scale-105 transition-transform inline-block">
          Vybes
        </Link>
        <div className="flex items-center gap-2 md:gap-4">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 md:py-16 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-gradient-to-br from-white/95 via-sky-50/50 to-blue-50/50 dark:from-gray-800/95 dark:via-sky-900/30 dark:to-blue-900/30 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border-2 border-sky-200/50 dark:border-sky-800/50 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-sky-400/20 to-blue-500/20 rounded-full blur-3xl -z-0"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-400/20 to-indigo-500/20 rounded-full blur-3xl -z-0"></div>

            <div className="relative z-10 text-center space-y-8 md:space-y-10">
              <Logo />

              <div className="text-2xl md:text-3xl lg:text-4xl font-black tracking-wide px-4">
                <span className="text-slate-700 dark:text-slate-200">{t('landing.hero.slogan.are')} </span>
                <span className="text-blue-600 dark:text-blue-500">{t('landing.hero.slogan.you')}</span>
                <span className="text-slate-700 dark:text-slate-200"> {t('landing.hero.slogan.readyToMakeSome')} </span>
                <span className="text-sky-500 dark:text-sky-400">{t('landing.hero.slogan.noise')}</span>
                <span className="text-slate-700 dark:text-slate-200">?</span>
              </div>

              <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                {t('auth.hero.description')}
              </p>

              <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.text}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 * index, duration: 0.25 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-2 border-sky-200/50 dark:border-sky-800/50 shadow-md"
                  >
                    <span className="text-lg">{feature.icon}</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{feature.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* Mode switch */}
              <div className="max-w-xl mx-auto">
                <div className="flex gap-2 mb-6">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                      mode === 'login'
                        ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30'
                        : 'bg-white/70 dark:bg-gray-900/40 text-slate-700 dark:text-slate-200 border-2 border-sky-200/60 dark:border-sky-800/60'
                    }`}
                  >
                    {t('auth.cta.login')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                      mode === 'register'
                        ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30'
                        : 'bg-white/70 dark:bg-gray-900/40 text-slate-700 dark:text-slate-200 border-2 border-sky-200/60 dark:border-sky-800/60'
                    }`}
                  >
                    {t('auth.cta.register')}
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {mode === 'login' ? (
                    <motion.div key="login" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                      <LoginForm />
                    </motion.div>
                  ) : (
                    <motion.div key="register" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                      <form onSubmit={handleRegister} className="space-y-4 text-left">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">
                            {t('auth.register.nameLabel')}
                          </Label>
                          <Input
                            id="name"
                            type="text"
                            placeholder={t('auth.register.namePlaceholder')}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            disabled={loading}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">
                            {t('auth.register.emailLabel')}
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder={t('auth.register.emailPlaceholder')}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            disabled={loading}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role" className="text-slate-700 dark:text-slate-300">
                            {t('auth.register.roleLabel')}
                          </Label>
                          <select
                            id="role"
                            className="flex h-10 w-full rounded-xl border-2 border-sky-200 dark:border-sky-800 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/20 focus-visible:border-sky-500 dark:focus-visible:border-sky-500 transition-all duration-200 shadow-sm hover:shadow-md focus-visible:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                            required
                            disabled={loading}
                          >
                            <option value="DEFAULT">{t('auth.register.role.viewer')}</option>
                            <option value="ARTIST">{t('auth.register.role.artist')}</option>
                            <option value="RECRUITER">{t('auth.register.role.recruiter')}</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">
                            {t('auth.register.passwordLabel')}
                          </Label>
                          <Input
                            id="password"
                            type="password"
                            placeholder={t('auth.register.passwordPlaceholder')}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            disabled={loading}
                            autoComplete="new-password"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-slate-300">
                            {t('auth.register.passwordConfirmLabel')}
                          </Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder={t('auth.register.confirmPasswordPlaceholder')}
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                            disabled={loading}
                            autoComplete="new-password"
                          />
                        </div>
                        <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-600 hover:via-blue-700 hover:to-indigo-700 text-white font-semibold py-6 rounded-xl shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40 transition-all duration-300">
                          {loading ? t('auth.register.submitting') : t('auth.register.submit')}
                        </Button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index, duration: 0.25 }}
                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 md:p-6 border-2 border-sky-200/50 dark:border-sky-800/50 shadow-lg text-center"
              >
                <div className="text-2xl md:text-3xl font-black bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-sm md:text-base font-semibold text-slate-600 dark:text-slate-300 mt-1">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}


