"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
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
import { ArrowLeft } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4 flex gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8 border border-sky-100 dark:border-sky-900 relative max-w-md w-full"
        >
          <Link
            href="/"
            className="absolute top-4 left-4 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100"
            aria-label={t('events.back')}
          >
            <ArrowLeft size={24} />
          </Link>

          <div className="flex justify-center mb-4">
            <Logo />
          </div>

          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 text-center">
            {mode === 'login' ? t('auth.login.title') : t('auth.register.title')}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-center mb-6">
            {mode === 'login' ? t('auth.login.subtitle') : t('auth.register.subtitle')}
          </p>

          <div className="flex gap-2 mb-6">
            <Button
              type="button"
              variant={mode === 'login' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setMode('login')}
            >
              {t('auth.cta.login')}
            </Button>
            <Button
              type="button"
              variant={mode === 'register' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setMode('register')}
            >
              {t('auth.cta.register')}
            </Button>
          </div>

          {mode === 'login' ? (
            <LoginForm />
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('auth.register.nameLabel')}</Label>
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
                <Label htmlFor="email">{t('auth.register.emailLabel')}</Label>
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
                <Label htmlFor="role">{t('auth.register.roleLabel')}</Label>
                <select
                  id="role"
                  className="flex h-10 w-full rounded-xl border-2 border-sky-200 dark:border-sky-800 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-sky-500 dark:focus-visible:border-sky-500 transition-all duration-200 shadow-sm hover:shadow-md focus-visible:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
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
                <Label htmlFor="password">{t('auth.register.passwordLabel')}</Label>
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
                <Label htmlFor="confirmPassword">{t('auth.register.passwordConfirmLabel')}</Label>
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

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? t('auth.register.submitting') : t('auth.register.submit')}
              </Button>
            </form>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}


