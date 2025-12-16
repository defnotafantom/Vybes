"use client"

import { useState } from 'react'
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

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'DEFAULT' as 'DEFAULT' | 'ARTIST' | 'RECRUITER',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
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

    toast({
      title: t('toast.validationOk'),
      description: t('toast.formValid'),
    })

    setLoading(true)

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
        router.push('/login')
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
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4 flex gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <AnimatePresence>
        <motion.div
          key="registerForm"
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
            Crea il tuo account
          </motion.h2>
          <motion.p 
            className="text-slate-600 dark:text-slate-400 text-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Unisciti alla community artistica
          </motion.p>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                className="bg-white dark:bg-gray-700"
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
              <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@esempio.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-white dark:bg-gray-700"
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
                className="flex h-10 w-full rounded-md border border-input bg-white dark:bg-gray-700 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
              <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="bg-white dark:bg-gray-700"
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
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="bg-white dark:bg-gray-700"
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
                className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold py-3"
                disabled={loading}
              >
                {loading ? 'Registrazione in corso...' : 'REGISTRATI'}
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
              <Link href="/login">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-2 border-sky-400 dark:border-sky-600 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/30 dark:to-blue-900/30 text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-semibold py-3"
                  disabled={loading}
                >
                  <span className="transition-all duration-200 hover:font-bold inline-block">
                    ACCEDI
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
