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
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { useLanguage } from '@/components/providers/language-provider'
import { ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // Check for verification success message
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('verified') === 'true') {
      toast({
        title: t('toast.emailVerified'),
        description: t('toast.emailVerifiedDesc'),
      })
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: t('toast.loginError'),
          description: result.error === 'CredentialsSignin' 
            ? t('toast.invalidCredentials')
            : result.error,
          variant: 'destructive',
        })
      } else {
        toast({
          title: t('toast.loginSuccess'),
          description: t('toast.loginRedirect'),
        })
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 1000)
      }
    } catch (error: any) {
      toast({
        title: t('toast.genericError'),
        description: error.message || t('toast.genericError'),
        variant: 'destructive',
      })
      console.error('Login error:', error)
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

      <AnimatePresence>
        <motion.div
          key="loginForm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8 border border-sky-100 dark:border-sky-900 relative max-w-md w-full"
        >
          {/* Freccia per tornare alla home */}
          <Link
            href="/"
            className="absolute top-4 left-4 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100"
          >
            <ArrowLeft size={24} />
          </Link>

          <motion.h2 
            className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Entra su Vybes
          </motion.h2>
          <motion.p 
            className="text-slate-600 dark:text-slate-400 text-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Gestisci account, notifiche, annunci e molto altro.
          </motion.p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Inserisci la tua email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white dark:bg-gray-700"
                disabled={loading}
                required
              />
            </motion.div>

            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Inserisci la tua password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white dark:bg-gray-700"
                disabled={loading}
                required
              />
              <Link 
                href="/forgot-password" 
                className="block text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 mt-1"
              >
                Hai dimenticato la password?
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold py-3 relative"
                disabled={loading}
              >
                {loading ? 'Accesso in corso...' : 'ACCEDI'}
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
                Non hai ancora un account?
              </p>
              <Link href="/register">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-2 border-sky-400 dark:border-sky-600 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/30 dark:to-blue-900/30 text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-semibold py-3"
                  disabled={loading}
                >
                  <span className="transition-all duration-200 hover:font-bold inline-block">
                    REGISTRATI
                  </span>
                </Button>
              </Link>
            </motion.div>
          </form>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
