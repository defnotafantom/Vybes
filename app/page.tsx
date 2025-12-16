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
import { Logo } from '@/components/logo'
import { WaveAnimation } from '@/components/landing/wave-animation'
import { X, Music, Briefcase, ArrowLeft } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type AuthMode = 'login' | 'register' | null

export default function LandingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useLanguage()
  const [openModal, setOpenModal] = useState<AuthMode>(null)
  
  // Login state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Register state
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    birthDate: '',
    email: '',
    email2: '',
    username: '',
    password: '',
    password2: '',
    artistName: '',
    companyType: '',
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    toast({
      title: '🔐 Tentativo di login',
      description: 'Verifica delle credenziali...',
      duration: 3000,
    })

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

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    )
  }

  const isValidUsername = (username: string) => /^[a-zA-Z0-9._]{3,30}$/.test(username)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { nome, cognome, birthDate, email, email2, password, password2, username, artistName, companyType } = formData
    const errors: string[] = []

    if (!nome) errors.push('Nome obbligatorio.')
    if (!cognome) errors.push('Cognome obbligatorio.')
    if (!birthDate) errors.push('Data di nascita obbligatoria.')
    if (!email || !email2) errors.push('Email obbligatoria e conferma necessaria.')
    if (email && email2 && email !== email2) errors.push('Le email non coincidono.')
    if (!username) errors.push('Username obbligatorio.')
    if (username && !isValidUsername(username)) errors.push('Username non valido.')
    if (!password || !password2) errors.push('Password obbligatoria e conferma necessaria.')
    if (password !== password2) errors.push('Le password non coincidono.')
    if (password && password.length < 6) errors.push('Password troppo corta.')
    if (selectedRoles.length === 0) errors.push('Seleziona almeno un ruolo.')

    if (errors.length > 0) {
      toast({
        title: t('toast.validationError'),
        description: errors.join(' '),
        variant: 'destructive',
      })
      setLoading(false)
      return
    }

    toast({
      title: t('toast.registrationAttempt'),
      description: t('toast.registrationSending'),
      duration: 3000,
    })

    try {
      // Convert roles to Prisma format
      let role: 'DEFAULT' | 'ARTIST' | 'RECRUITER' = 'DEFAULT'
      if (selectedRoles.includes('artist') && selectedRoles.includes('stager')) {
        role = 'ARTIST' // Default to ARTIST if both selected, you might want to handle this differently
      } else if (selectedRoles.includes('artist')) {
        role = 'ARTIST'
      } else if (selectedRoles.includes('stager')) {
        role = 'RECRUITER'
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${nome} ${cognome}`,
          email,
          password,
          role,
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
        setSelectedRoles([])
        setFormData({
          nome: '',
          cognome: '',
          birthDate: '',
          email: '',
          email2: '',
          username: '',
          password: '',
          password2: '',
          artistName: '',
          companyType: '',
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
      {/* Header */}
      <header className="container mx-auto px-4 py-4 md:py-6 flex justify-between items-center relative z-20">
        <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
          Vybes
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12 md:py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 md:space-y-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="space-y-4 md:space-y-6"
          >
            <Logo />
            
            {/* Slogan */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl md:text-2xl lg:text-3xl font-bold tracking-wide px-4"
            >
              <span className="text-slate-700 dark:text-slate-200">ARE </span>
              <span className="text-blue-600 dark:text-blue-500">YOU</span>
              <span className="text-slate-700 dark:text-slate-200"> READY TO MAKE SOME </span>
              <span className="text-sky-500 dark:text-sky-400">NOISE</span>
              <span className="text-slate-700 dark:text-slate-200">?</span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="space-y-6 md:space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
            >
              <Button
                onClick={() => setOpenModal('login')}
                size="lg"
                className="w-full sm:w-auto text-base md:text-lg px-8 md:px-10 py-6 md:py-7 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-xl shadow-sky-500/30 hover:shadow-2xl hover:shadow-sky-500/40 transition-all duration-300 hover:scale-105 font-bold tracking-wide"
              >
                Let&apos;s go!
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Wave Animation */}
      <div className="fixed bottom-0 left-0 w-full z-0">
        <WaveAnimation />
      </div>

      {/* Backdrop and Modals */}
      <AnimatePresence>
        {openModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpenModal(null)}
              className="fixed inset-0 bg-gradient-to-br from-black/60 via-sky-900/40 to-blue-900/40 backdrop-blur-md z-40"
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
                    className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 via-sky-600 to-blue-600 dark:from-slate-100 dark:via-sky-400 dark:to-blue-400 bg-clip-text text-transparent mb-2 text-center relative z-10"
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

                  <form onSubmit={handleLogin} className="space-y-6">
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
                        placeholder="nome@esempio.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border-2 border-sky-200 dark:border-sky-800 focus:border-sky-500 dark:focus:border-sky-500 rounded-xl transition-all shadow-sm hover:shadow-md focus:shadow-lg focus:ring-2 focus:ring-sky-500/20"
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
                      <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">
                        Password
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Inserisci la tua password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border-2 border-sky-200 dark:border-sky-800 focus:border-sky-500 dark:focus:border-sky-500 rounded-xl transition-all shadow-sm hover:shadow-md focus:shadow-lg focus:ring-2 focus:ring-sky-500/20"
                        required
                        disabled={loading}
                      />
                      <Link
                        href="/forgot-password"
                        className="block text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 mt-1 transition-colors"
                        onClick={() => setOpenModal(null)}
                      >
                        Hai dimenticato la password?
                      </Link>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-600 hover:via-blue-600 hover:to-blue-700 text-white font-bold py-3 shadow-xl shadow-sky-500/40 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-sky-500/50"
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
                            Accesso in corso...
                          </span>
                        ) : (
                          'ACCEDI'
                        )}
                      </Button>
                    </motion.div>

                    <div className="border-t border-sky-200 dark:border-sky-800 my-4"></div>

                    <motion.div
                      className="text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <p className="text-slate-600 dark:text-slate-400 mb-2">
                        Non hai ancora un account?
                      </p>
                      <Button
                        type="button"
                        onClick={() => setOpenModal('register')}
                        variant="outline"
                        className="w-full border-2 border-sky-400 dark:border-sky-600 bg-gradient-to-r from-sky-50/80 to-blue-50/80 dark:from-sky-900/40 dark:to-blue-900/40 backdrop-blur-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 hover:border-sky-500 dark:hover:border-sky-500 font-bold py-3 shadow-md hover:shadow-lg transition-all hover:scale-105"
                        disabled={loading}
                      >
                        REGISTRATI
                      </Button>
                    </motion.div>
                  </form>
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
                className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col md:flex-row items-stretch justify-center gap-4 md:gap-6 w-full max-w-6xl my-4">
                  {/* Info Box */}
                  <motion.div
                    className="flex-none w-full md:w-[500px] lg:w-[600px] bg-gradient-to-br from-white/95 to-sky-50/50 dark:from-gray-800/95 dark:to-sky-900/30 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-8 border-2 border-sky-200/50 dark:border-sky-800/50 overflow-hidden relative"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    {/* Decorative gradient overlay */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-sky-400/20 to-blue-500/20 rounded-full blur-3xl -z-0"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-400/20 to-indigo-500/20 rounded-full blur-3xl -z-0"></div>
                    
                    <div className="relative z-10 mb-6">
                      <motion.div
                        className="flex items-center gap-3 mb-3"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
                          <Music className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                          Artista
                        </h3>
                      </motion.div>
                      <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed pl-1">
                        Crea e gestisci il tuo profilo, pubblica contenuti e partecipa ad eventi.
                        I contenuti più pertinenti vengono mostrati al pubblico grazie a un algoritmo dedicato.
                        Collabora con altri artisti o recruiter tramite la piattaforma.
                      </p>
                    </div>
                    <div className="relative z-10">
                      <motion.div
                        className="flex items-center gap-3 mb-3"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
                          <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          Recruiter
                        </h3>
                      </motion.div>
                      <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed pl-1">
                        Pubblica eventi, cerca artisti, gestisce candidature e organizza collaborazioni
                        attraverso la propria dashboard. Visualizza il feed completo e crea annunci sulla mappa
                        per evidenziare ciò che cerchi.
                      </p>
                    </div>
                  </motion.div>

                  {/* Register Form */}
                  <motion.div
                    className="flex-none w-full md:w-[500px] bg-gradient-to-br from-white/95 to-blue-50/50 dark:from-gray-800/95 dark:to-blue-900/30 backdrop-blur-xl rounded-3xl shadow-2xl p-4 md:p-6 lg:p-8 border-2 border-sky-200/50 dark:border-sky-800/50 overflow-auto relative max-h-[90vh]"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-sky-400/10 to-blue-500/10 rounded-full blur-2xl -z-0"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-400/10 to-indigo-500/10 rounded-full blur-2xl -z-0"></div>
                    <button
                      onClick={() => setOpenModal(null)}
                      className="absolute top-4 right-4 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 transition-colors z-10"
                    >
                      <X size={24} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setOpenModal('login')}
                      className="absolute top-4 left-4 flex items-center justify-center w-10 h-10 rounded-full bg-white/80 dark:bg-gray-700/80 border border-sky-200 dark:border-sky-800 shadow hover:bg-sky-50 dark:hover:bg-sky-900/20 transition z-10"
                    >
                      <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                    </button>

                    <div className="text-center space-y-3 pb-4 pt-2 relative z-10">
                      <motion.h3
                        className="font-bold text-lg md:text-xl bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-100 bg-clip-text text-transparent"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        Quali ruoli vuoi assumere?
                      </motion.h3>
                      <motion.p
                        className="text-sm text-slate-500 dark:text-slate-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.45 }}
                      >
                        Puoi selezionare uno o entrambi i ruoli.
                      </motion.p>

                      <div className="flex justify-center gap-4 md:gap-6 pt-3">
                        <motion.button
                          type="button"
                          onClick={() => toggleRole('artist')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`relative flex flex-col items-center justify-center w-28 md:w-32 py-4 md:py-6 rounded-2xl border-2 transition-all duration-300 shadow-lg overflow-hidden ${
                            selectedRoles.includes('artist')
                              ? 'bg-gradient-to-r from-sky-500 to-sky-600 border-sky-600 text-white shadow-xl shadow-sky-500/40'
                              : 'border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:border-sky-400 dark:hover:border-sky-600 hover:shadow-xl'
                          }`}
                        >
                          {selectedRoles.includes('artist') && (
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-sky-400 to-sky-500 opacity-50"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 0.5 }}
                              transition={{ duration: 0.3 }}
                            />
                          )}
                          <div className="relative z-10">
                            <Music className={`w-5 h-5 md:w-6 md:h-6 mb-2 ${selectedRoles.includes('artist') ? 'text-white' : 'text-sky-600 dark:text-sky-400'}`} />
                            <span className="text-sm md:text-base font-semibold block">Artista</span>
                          </div>
                        </motion.button>

                        <motion.button
                          type="button"
                          onClick={() => toggleRole('stager')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`relative flex flex-col items-center justify-center w-28 md:w-32 py-4 md:py-6 rounded-2xl border-2 transition-all duration-300 shadow-lg overflow-hidden ${
                            selectedRoles.includes('stager')
                              ? 'bg-gradient-to-r from-blue-600 to-blue-700 border-blue-700 text-white shadow-xl shadow-blue-500/40'
                              : 'border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-xl'
                          }`}
                        >
                          {selectedRoles.includes('stager') && (
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-50"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 0.5 }}
                              transition={{ duration: 0.3 }}
                            />
                          )}
                          <div className="relative z-10">
                            <Briefcase className={`w-5 h-5 md:w-6 md:h-6 mb-2 ${selectedRoles.includes('stager') ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
                            <span className="text-sm md:text-base font-semibold block">Recruiter</span>
                          </div>
                        </motion.button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {selectedRoles.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                          className="relative bg-gradient-to-r from-sky-50/80 to-blue-50/80 dark:from-sky-900/30 dark:to-blue-900/30 border-2 border-sky-200/50 dark:border-sky-800/50 rounded-2xl p-3 md:p-4 mb-4 md:mb-6 backdrop-blur-sm shadow-lg"
                        >
                          <p className="text-slate-700 dark:text-slate-200 font-semibold mb-3 text-sm md:text-base flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 animate-pulse"></span>
                            Hai selezionato:
                          </p>
                          <ul className="flex gap-2 flex-wrap">
                            {selectedRoles.map((r, index) => (
                              <motion.li
                                key={r}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className={`px-4 py-2 rounded-full text-xs md:text-sm font-bold shadow-md transition-all hover:scale-105 ${
                                  r === 'artist' 
                                    ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-sky-500/30' 
                                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-500/30'
                                }`}
                              >
                                {r === 'artist' ? '🎤 Artista' : '🎭 Recruiter'}
                              </motion.li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {selectedRoles.length > 0 && (
                      <form onSubmit={handleRegister} className="space-y-3 md:space-y-4 relative z-10">
                        <motion.div
                          className="grid grid-cols-2 gap-3 md:gap-4"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                        >
                          <div className="space-y-2">
                            <Label htmlFor="nome" className="text-slate-700 dark:text-slate-300 text-sm font-semibold">Nome</Label>
                            <Input
                              id="nome"
                              placeholder="Nome"
                              onChange={handleInputChange}
                              disabled={loading}
                              value={formData.nome}
                              className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border-2 border-sky-200 dark:border-sky-800 focus:border-sky-500 dark:focus:border-sky-500 rounded-xl text-sm transition-all shadow-sm hover:shadow-md focus:shadow-lg"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cognome" className="text-slate-700 dark:text-slate-300 text-sm font-semibold">Cognome</Label>
                            <Input
                              id="cognome"
                              placeholder="Cognome"
                              onChange={handleInputChange}
                              disabled={loading}
                              value={formData.cognome}
                              className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border-2 border-sky-200 dark:border-sky-800 focus:border-sky-500 dark:focus:border-sky-500 rounded-xl text-sm transition-all shadow-sm hover:shadow-md focus:shadow-lg"
                              required
                            />
                          </div>
                        </motion.div>

                        <motion.div
                          className="space-y-2"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.55 }}
                        >
                          <Label htmlFor="birthDate" className="text-slate-700 dark:text-slate-300 text-sm font-semibold">Data di nascita</Label>
                          <Input
                            id="birthDate"
                            type="date"
                            onChange={handleInputChange}
                            disabled={loading}
                            value={formData.birthDate}
                            className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border-2 border-sky-200 dark:border-sky-800 focus:border-sky-500 dark:focus:border-sky-500 rounded-xl text-sm transition-all shadow-sm hover:shadow-md focus:shadow-lg"
                            required
                          />
                        </motion.div>

                        <motion.div
                          className="space-y-2"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                        >
                          <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 text-sm font-semibold">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="tua@email.com"
                            onChange={handleInputChange}
                            disabled={loading}
                            value={formData.email}
                            className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border-2 border-sky-200 dark:border-sky-800 focus:border-sky-500 dark:focus:border-sky-500 rounded-xl text-sm transition-all shadow-sm hover:shadow-md focus:shadow-lg"
                            required
                          />
                        </motion.div>
                        <motion.div
                          className="space-y-2"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.65 }}
                        >
                          <Label htmlFor="email2" className="text-slate-700 dark:text-slate-300 text-sm font-semibold">Conferma Email</Label>
                          <Input
                            id="email2"
                            type="email"
                            placeholder="Conferma email"
                            onChange={handleInputChange}
                            disabled={loading}
                            value={formData.email2}
                            className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border-2 border-sky-200 dark:border-sky-800 focus:border-sky-500 dark:focus:border-sky-500 rounded-xl text-sm transition-all shadow-sm hover:shadow-md focus:shadow-lg"
                            required
                          />
                        </motion.div>

                        <motion.div
                          className="space-y-2"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7 }}
                        >
                          <Label htmlFor="username" className="text-slate-700 dark:text-slate-300 text-sm font-semibold">Username</Label>
                          <Input
                            id="username"
                            placeholder="Username unico"
                            onChange={handleInputChange}
                            disabled={loading}
                            value={formData.username}
                            className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border-2 border-sky-200 dark:border-sky-800 focus:border-sky-500 dark:focus:border-sky-500 rounded-xl text-sm transition-all shadow-sm hover:shadow-md focus:shadow-lg"
                            required
                          />
                        </motion.div>

                        <motion.div
                          className="space-y-2"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.75 }}
                        >
                          <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 text-sm font-semibold">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            placeholder="Password sicura"
                            onChange={handleInputChange}
                            disabled={loading}
                            value={formData.password}
                            className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border-2 border-sky-200 dark:border-sky-800 focus:border-sky-500 dark:focus:border-sky-500 rounded-xl text-sm transition-all shadow-sm hover:shadow-md focus:shadow-lg"
                            required
                          />
                        </motion.div>
                        <motion.div
                          className="space-y-2"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8 }}
                        >
                          <Label htmlFor="password2" className="text-slate-700 dark:text-slate-300 text-sm font-semibold">Conferma Password</Label>
                          <Input
                            id="password2"
                            type="password"
                            placeholder="Conferma password"
                            onChange={handleInputChange}
                            disabled={loading}
                            value={formData.password2}
                            className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border-2 border-sky-200 dark:border-sky-800 focus:border-sky-500 dark:focus:border-sky-500 rounded-xl text-sm transition-all shadow-sm hover:shadow-md focus:shadow-lg"
                            required
                          />
                        </motion.div>

                        <AnimatePresence>
                          {selectedRoles.includes('artist') && (
                            <motion.div
                              className="space-y-2"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Label htmlFor="artistName" className="text-slate-700 dark:text-slate-300 text-sm font-semibold flex items-center gap-2">
                                <Music className="w-4 h-4 text-sky-500" />
                                Nome d&apos;arte
                              </Label>
                              <Input
                                id="artistName"
                                placeholder="Il tuo nome d'arte"
                                onChange={handleInputChange}
                                disabled={loading}
                                value={formData.artistName}
                                className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border-2 border-sky-200 dark:border-sky-800 focus:border-sky-500 dark:focus:border-sky-500 rounded-xl text-sm transition-all shadow-sm hover:shadow-md focus:shadow-lg"
                              />
                            </motion.div>
                          )}

                          {selectedRoles.includes('stager') && (
                            <motion.div
                              className="space-y-2"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Label className="text-slate-700 dark:text-slate-300 text-sm font-semibold flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-blue-500" />
                                Tipo di recruiter
                              </Label>
                              <Select
                                onValueChange={(value) => setFormData({ ...formData, companyType: value })}
                                disabled={loading}
                                value={formData.companyType}
                              >
                                <SelectTrigger className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border-2 border-sky-200 dark:border-sky-800 focus:border-sky-500 dark:focus:border-sky-500 rounded-xl text-sm transition-all shadow-sm hover:shadow-md">
                                  <SelectValue placeholder="Seleziona tipo..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="privato">Privato</SelectItem>
                                  <SelectItem value="azienda">Azienda</SelectItem>
                                </SelectContent>
                              </Select>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.85 }}
                          className="pt-2"
                        >
                          <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold py-3 shadow-xl shadow-sky-500/40 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-sky-500/50"
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

                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.9 }}
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            className="mt-2 w-full text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-all"
                            onClick={() => setOpenModal('login')}
                            disabled={loading}
                          >
                            ← Torna al login
                          </Button>
                        </motion.div>
                      </form>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
