"use client"

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/logo'

export default function ResetPasswordClient() {
  const router = useRouter()
  const params = useSearchParams()
  const { toast } = useToast()

  const email = useMemo(() => (params.get('email') || '').trim().toLowerCase(), [params])
  const token = useMemo(() => (params.get('token') || '').trim(), [params])

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const canSubmit = !!email && !!token && password.length >= 8 && password === confirm && !loading

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !token) {
      toast({ title: 'Errore', description: 'Link non valido.', variant: 'destructive' })
      return
    }
    if (password.length < 8) {
      toast({ title: 'Errore', description: 'Password troppo corta (min 8 caratteri).', variant: 'destructive' })
      return
    }
    if (password !== confirm) {
      toast({ title: 'Errore', description: 'Le password non coincidono.', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, password }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || `Errore (${res.status})`)
      }
      toast({ title: 'Password aggiornata', description: 'Ora puoi accedere con la nuova password.' })
      router.push('/auth')
    } catch (e: any) {
      toast({ title: 'Errore', description: e?.message || 'Errore reset password', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8 border border-sky-100 dark:border-sky-900 relative max-w-md w-full"
      >
        <Link
          href="/auth"
          className="absolute top-4 left-4 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100"
          aria-label="Torna al login"
        >
          <ArrowLeft size={24} />
        </Link>

        <div className="flex justify-center mb-4">
          <Logo />
        </div>

        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 text-center">Reset password</h2>
        <p className="text-slate-600 dark:text-slate-400 text-center mb-6">
          Scegli una nuova password per <span className="font-semibold">{email || 'il tuo account'}</span>.
        </p>

        {!email || !token ? (
          <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50/70 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-300">
            Link non valido o mancante. Richiedi di nuovo il reset dal login.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nuova password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="pr-12"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-gray-800/60 transition-colors"
                  aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
                  title={showPassword ? 'Nascondi password' : 'Mostra password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Minimo 8 caratteri.</div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Conferma password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  className="pr-12"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-gray-800/60 transition-colors"
                  aria-label={showConfirm ? 'Nascondi password' : 'Mostra password'}
                  title={showConfirm ? 'Nascondi password' : 'Mostra password'}
                >
                  {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={!canSubmit}>
              {loading ? 'Salvataggio…' : 'Imposta nuova password'}
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  )
}






