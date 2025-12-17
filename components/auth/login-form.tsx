"use client"

import { useState, useEffect, useRef } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { useLanguage } from '@/components/providers/language-provider'
import { User, RefreshCw } from 'lucide-react'

interface UserPreview {
  id: string
  email: string
  username: string | null
  name: string | null
  image: string | null
  avatar: any | null
  role: string
}

interface LoginFormProps {
  onSuccess?: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useLanguage()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [userPreview, setUserPreview] = useState<UserPreview | null>(null)
  const [useAvatar, setUseAvatar] = useState(false)
  const [checkingUser, setCheckingUser] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Check user when identifier changes (with debounce)
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (!identifier || identifier.length < 3) {
      setUserPreview(null)
      return
    }

    setCheckingUser(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/auth/check-user?identifier=${encodeURIComponent(identifier)}`)
        const data = await response.json()
        
        if (data.user) {
          setUserPreview(data.user)
          setUseAvatar(data.user.useAvatar || false)
        } else {
          setUserPreview(null)
        }
      } catch (error) {
        console.error('Error checking user:', error)
        setUserPreview(null)
      } finally {
        setCheckingUser(false)
      }
    }, 300) // 300ms debounce

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [identifier])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: identifier, // This field accepts both email and username now
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
        if (onSuccess) {
          onSuccess()
        } else {
          setTimeout(() => {
            router.push('/dashboard')
            router.refresh()
          }, 1000)
        }
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
    <form onSubmit={handleLogin} className="space-y-6">
      {/* User Preview */}
      <AnimatePresence>
        {userPreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 rounded-xl p-4 border-2 border-sky-200 dark:border-sky-800"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-14 w-14 border-2 border-sky-400 dark:border-sky-600">
                  {useAvatar && userPreview.avatar ? (
                    // TODO: Render 3D avatar here when available
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500">
                      <User className="h-7 w-7 text-white" />
                    </AvatarFallback>
                  ) : (
                    <>
                      <AvatarImage src={userPreview.image || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-sky-500 to-blue-600">
                        {userPreview.name?.charAt(0).toUpperCase() || userPreview.username?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </>
                  )}
                </Avatar>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-white dark:bg-gray-800 border-2 border-sky-400 dark:border-sky-600 hover:bg-sky-100 dark:hover:bg-sky-900/30 shadow-sm"
                  onClick={() => setUseAvatar(!useAvatar)}
                  title={useAvatar ? 'Mostra immagine profilo' : 'Mostra avatar 3D'}
                >
                  <RefreshCw className="h-3 w-3 text-sky-600 dark:text-sky-400" />
                </Button>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-slate-800 dark:text-slate-100">
                  {userPreview.name || userPreview.username || 'Utente'}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {userPreview.email}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Label htmlFor="identifier" className="text-slate-700 dark:text-slate-300">
          {t('auth.login.identifierLabel')}
        </Label>
        <div className="relative">
          <Input
            id="identifier"
            type="text"
            placeholder={t('login.identifierPlaceholder')}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border-2 border-sky-200 dark:border-sky-800 focus:border-sky-500 dark:focus:border-sky-500 rounded-xl transition-all shadow-sm hover:shadow-md focus:shadow-lg focus:ring-2 focus:ring-sky-500/20 relative z-10"
            required
            disabled={loading}
          />
          {checkingUser && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw className="h-4 w-4 text-sky-500" />
              </motion.div>
            </div>
          )}
        </div>
      </motion.div>

      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">
          {t('common.password')}
        </Label>
        <Input
          id="password"
          type="password"
          placeholder={t('login.passwordPlaceholder')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border-2 border-sky-200 dark:border-sky-800 focus:border-sky-500 dark:focus:border-sky-500 rounded-xl transition-all shadow-sm hover:shadow-md focus:shadow-lg focus:ring-2 focus:ring-sky-500/20 relative z-10"
          required
          disabled={loading}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-600 hover:via-blue-700 hover:to-indigo-700 text-white font-semibold py-6 rounded-xl shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40 transition-all duration-300"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw className="h-5 w-5" />
              </motion.div>
              {t('auth.login.submitting')}
            </span>
          ) : (
            t('auth.cta.login')
          )}
        </Button>
      </motion.div>
    </form>
  )
}

