"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useLanguage } from '@/components/providers/language-provider'
import { LoginForm } from '@/components/auth/login-form'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

type AuthMode = 'login' | 'register'

export default function AuthPage() {
  const router = useRouter()
  const { status } = useSession()
  const { toast } = useToast()
  const { t } = useLanguage()

  const [mode, setMode] = useState<AuthMode>('login')
  const [loading, setLoading] = useState(false)
  const [showRole, setShowRole] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [fieldError, setFieldError] = useState<{ password?: string; confirmPassword?: string }>({})
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'DEFAULT' as 'DEFAULT' | 'ARTIST' | 'RECRUITER',
  })

  useEffect(() => {
    if (status === 'authenticated') router.replace('/dashboard')
  }, [status, router])

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
    setFieldError({})

    if (formData.password !== formData.confirmPassword) {
      setFieldError({ confirmPassword: t('toast.passwordMismatch') })
      toast({ title: t('toast.validationError'), description: t('toast.passwordMismatch'), variant: 'destructive' })
      return
    }
    if (formData.password.length < 8) {
      setFieldError({ password: t('toast.passwordTooShort') })
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
    <div className="min-h-screen bg-gradient-to-b from-white via-sky-50/30 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      {/* Header controls */}
      <div className="fixed top-4 right-4 z-50">
        <div className="flex items-center gap-1 p-1 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl border border-white/40 dark:border-gray-700/40 shadow-lg">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/20 p-6 md:p-8 border border-white/40 dark:border-gray-700/40 relative max-w-md w-full"
        >
          {/* Back button */}
          <Link
            href="/"
            className="absolute top-4 left-4 p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={t('events.back')}
          >
            <ArrowLeft size={20} />
          </Link>

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 grid place-items-center shadow-lg shadow-sky-500/20">
                <span className="text-white font-black text-2xl">V</span>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                Vybes
              </span>
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            {mode === 'login' ? t('auth.login.title') : t('auth.register.title')}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
            {mode === 'login' ? t('auth.login.subtitle') : t('auth.register.subtitle')}
          </p>

          {/* Mode tabs */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={cn(
                "flex-1 py-2.5 text-sm font-medium rounded-lg transition-all",
                mode === 'login' 
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" 
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              {t('auth.cta.login')}
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={cn(
                "flex-1 py-2.5 text-sm font-medium rounded-lg transition-all",
                mode === 'register' 
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" 
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              {t('auth.cta.register')}
            </button>
          </div>

          {mode === 'login' ? (
            <LoginForm />
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700 dark:text-gray-300 text-sm">{t('auth.register.nameLabel')}</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={t('auth.register.namePlaceholder')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={loading}
                  className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-xl h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 text-sm">{t('auth.register.emailLabel')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.register.emailPlaceholder')}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={loading}
                  className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-xl h-11"
                />
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 p-3">
                <button
                  type="button"
                  onClick={() => setShowRole((v) => !v)}
                  className="w-full flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  <span>Opzioni avanzate</span>
                  <span className="text-xs text-gray-500">{showRole ? '−' : '+'}</span>
                </button>
                {showRole && (
                  <div className="mt-3 space-y-2">
                    <Label htmlFor="role" className="text-gray-600 dark:text-gray-400 text-sm">
                      {t('auth.register.roleLabel')}
                    </Label>
                    <select
                      id="role"
                      className="flex h-10 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 px-3 py-2 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                      disabled={loading}
                    >
                      <option value="DEFAULT">{t('auth.register.role.viewer')}</option>
                      <option value="ARTIST">{t('auth.register.role.artist')}</option>
                      <option value="RECRUITER">{t('auth.register.role.recruiter')}</option>
                    </select>
                    <p className="text-xs text-gray-500">
                      Puoi cambiare questo anche più avanti dalle impostazioni.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 text-sm">{t('auth.register.passwordLabel')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('auth.register.passwordPlaceholder')}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    disabled={loading}
                    autoComplete="new-password"
                    className="pr-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-xl h-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <PasswordStrength password={formData.password} />
                {fieldError.password && <p className="text-xs text-red-500">{fieldError.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300 text-sm">{t('auth.register.passwordConfirmLabel')}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder={t('auth.register.confirmPasswordPlaceholder')}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    disabled={loading}
                    autoComplete="new-password"
                    className="pr-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-xl h-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldError.confirmPassword && <p className="text-xs text-red-500">{fieldError.confirmPassword}</p>}
              </div>

              <p className="text-xs text-gray-500">
                Registrandoti accetti i termini e riceverai un&apos;email di verifica.
              </p>

              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-xl h-11 font-medium"
              >
                {loading ? t('auth.register.submitting') : t('auth.register.submit')}
              </Button>
            </form>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function PasswordStrength({ password }: { password: string }) {
  const score = (() => {
    let s = 0
    if (!password) return 0
    if (password.length >= 8) s += 1
    if (password.length >= 12) s += 1
    if (/[A-Z]/.test(password)) s += 1
    if (/[0-9]/.test(password)) s += 1
    if (/[^A-Za-z0-9]/.test(password)) s += 1
    return Math.min(5, s)
  })()

  const label =
    score <= 1 ? 'Debole' : score === 2 ? 'Ok' : score === 3 ? 'Buona' : score === 4 ? 'Forte' : 'Molto forte'

  const width = `${(score / 5) * 100}%`
  const color =
    score <= 1 ? 'bg-red-500' : score === 2 ? 'bg-amber-500' : score === 3 ? 'bg-yellow-400' : score === 4 ? 'bg-sky-500' : 'bg-emerald-500'

  return (
    <div className="space-y-1">
      <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-300', color)} style={{ width }} />
      </div>
      <div className="flex justify-between text-[11px] text-gray-500">
        <span>Sicurezza</span>
        <span className="font-medium">{label}</span>
      </div>
    </div>
  )
}
