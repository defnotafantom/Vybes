"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Coins, Gift, HelpCircle, CheckCircle, Clock, Play } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useLanguage } from '@/components/providers/language-provider'

interface WheelReward {
  coins: number
  label: string
  segmentId: number
  color: string
}

interface Quiz {
  id: string
  title: string
  description: string
  questions: number
  rewardCoins: number
  completionReward: string
  completed: boolean
}

export default function MinigamesPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const { t } = useLanguage()
  const [coins, setCoins] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [canSpin, setCanSpin] = useState(true)
  const [wheelRotation, setWheelRotation] = useState(0)
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null)
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [quizProgress, setQuizProgress] = useState<Record<string, number>>({})

  useEffect(() => {
    fetchUserCoins()
    checkWheelSpin()
    fetchQuizzes()
  }, [])

  const fetchUserCoins = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setCoins(data.coins || 0)
      }
    } catch (error) {
      console.error('Error fetching coins:', error)
    }
  }

  const checkWheelSpin = async () => {
    try {
      const response = await fetch('/api/minigames/wheel')
      if (response.ok) {
        const data = await response.json()
        setCanSpin(data.canSpin)
      }
    } catch (error) {
      console.error('Error checking wheel spin:', error)
    }
  }

  const fetchQuizzes = async () => {
    try {
      const response = await fetch('/api/minigames/quiz')
      if (response.ok) {
        const data = await response.json()
        setQuizzes(data.quizzes || [])
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error)
    }
  }

  const spinWheel = async () => {
    if (spinning || !canSpin) return

    setSpinning(true)
    
    try {
      const response = await fetch('/api/minigames/wheel', {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        const reward: WheelReward = data.reward
        
        // Calculate rotation (multiple full spins + segment position)
        const segmentAngle = 360 / 6 // 6 segments
        const targetSegment = reward.segmentId - 1
        const baseRotation = 360 * 5 // 5 full spins
        const segmentRotation = targetSegment * segmentAngle
        const finalRotation = baseRotation + segmentRotation + (360 - (wheelRotation % 360))
        
        setWheelRotation(prev => prev + finalRotation)

        setTimeout(() => {
          toast({
            title: '🎉 Complimenti!',
            description: `Hai vinto ${reward.label}!`,
          })
          setCoins(data.newCoins)
          setCanSpin(false)
          setSpinning(false)
        }, 4000) // Animation duration
      } else {
        toast({
          title: t('toast.wheelWarning'),
          description: data.error || t('toast.wheelError'),
          variant: 'destructive',
        })
        setSpinning(false)
      }
    } catch (error) {
      console.error('Error spinning wheel:', error)
      toast({
        title: t('toast.error'),
        description: t('toast.wheelError'),
        variant: 'destructive',
      })
      setSpinning(false)
    }
  }

  const startQuiz = (quizId: string) => {
    setSelectedQuiz(quizId)
    setQuizProgress(prev => ({ ...prev, [quizId]: 0 }))
  }

  const submitQuizAnswer = async (quizId: string, questionIndex: number) => {
    try {
      const response = await fetch('/api/minigames/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId,
          questionIndex,
          answer: 'mockup', // Mockup answer
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setCoins(data.newCoins)
        setQuizProgress(prev => ({
          ...prev,
          [quizId]: (prev[quizId] || 0) + 1,
        }))

        const quiz = quizzes.find(q => q.id === quizId)
        if (quiz && (quizProgress[quizId] || 0) + 1 >= quiz.questions) {
          // Complete quiz
          const completeResponse = await fetch('/api/minigames/quiz', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              quizId,
              completionReward: quiz.completionReward,
            }),
          })

          if (completeResponse.ok) {
            toast({
              title: t('toast.quizCompleted'),
              description: t('toast.quizUnlockOutfit'),
            })
            fetchQuizzes()
            setSelectedQuiz(null)
          }
        }
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
    }
  }

  // Wheel segments with colors
  const segments = [
    { id: 1, label: '5', coins: 5, color: '#3b82f6' }, // blue
    { id: 2, label: '10', coins: 10, color: '#8b5cf6' }, // purple
    { id: 3, label: '15', coins: 15, color: '#ec4899' }, // pink
    { id: 4, label: '20', coins: 20, color: '#f59e0b' }, // amber
    { id: 5, label: '50', coins: 50, color: '#ef4444' }, // red
    { id: 6, label: '100', coins: 100, color: '#10b981' }, // green
  ]

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-sky-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Minigiochi
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Gira la ruota e completa i quiz per guadagnare monete!
            </p>
          </div>
          
          {/* Coins Display */}
          <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-300 dark:border-amber-700">
            <CardContent className="p-4 flex items-center gap-2">
              <Coins className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <span className="font-bold text-amber-700 dark:text-amber-300 text-lg">{coins}</span>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="wheel" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="wheel" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              <span className="hidden sm:inline">Lucky Wheel</span>
              <span className="sm:hidden">Ruota</span>
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Questionari</span>
              <span className="sm:hidden">Quiz</span>
            </TabsTrigger>
          </TabsList>

          {/* Lucky Wheel Tab */}
          <TabsContent value="wheel" className="space-y-6">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-purple-500" />
                  Lucky Wheel della Fortuna
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8 md:py-12 space-y-8">
                {/* Wheel Container */}
                <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto">
                  {/* Wheel */}
                  <motion.div
                    className="relative w-full h-full rounded-full border-8 border-slate-200 dark:border-slate-700 overflow-hidden shadow-2xl"
                    animate={{ rotate: wheelRotation }}
                    transition={{ 
                      duration: spinning ? 4 : 0,
                      ease: "easeOut"
                    }}
                    style={{ transformOrigin: 'center' }}
                  >
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200" style={{ transform: 'rotate(0deg)' }}>
                      {segments.map((segment, index) => {
                        const angle = (360 / segments.length) * index
                        const nextAngle = (360 / segments.length) * (index + 1)
                        const startAngle = (angle - 90) * Math.PI / 180
                        const endAngle = (nextAngle - 90) * Math.PI / 180
                        
                        const x1 = 100 + 100 * Math.cos(startAngle)
                        const y1 = 100 + 100 * Math.sin(startAngle)
                        const x2 = 100 + 100 * Math.cos(endAngle)
                        const y2 = 100 + 100 * Math.sin(endAngle)
                        
                        const largeArc = (nextAngle - angle) > 180 ? 1 : 0
                        const midAngle = (angle + nextAngle) / 2
                        const textX = 100 + 60 * Math.cos((midAngle - 90) * Math.PI / 180)
                        const textY = 100 + 60 * Math.sin((midAngle - 90) * Math.PI / 180)
                        
                        return (
                          <g key={segment.id}>
                            <path
                              d={`M 100 100 L ${x1} ${y1} A 100 100 0 ${largeArc} 1 ${x2} ${y2} Z`}
                              fill={segment.color}
                              stroke="white"
                              strokeWidth="2"
                            />
                            <text
                              x={textX}
                              y={textY}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fill="white"
                              fontSize="20"
                              fontWeight="bold"
                              className="pointer-events-none select-none"
                            >
                              {segment.label}
                            </text>
                          </g>
                        )
                      })}
                    </svg>
                  </motion.div>

                  {/* Center Pin */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full border-4 border-white dark:border-slate-800 shadow-xl z-10 flex items-center justify-center">
                    <div className="w-4 h-4 md:w-6 md:h-6 bg-white rounded-full"></div>
                  </div>

                  {/* Pointer */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[20px] border-r-[20px] border-t-[30px] border-l-transparent border-r-transparent border-t-sky-500 z-20 shadow-lg"></div>
                </div>

                {/* Spin Button */}
                <Button
                  onClick={spinWheel}
                  disabled={spinning || !canSpin}
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white font-bold text-lg px-8 py-6 shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/40 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {spinning ? (
                    <span className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Gift className="h-5 w-5" />
                      </motion.div>
                      Girando...
                    </span>
                  ) : !canSpin ? (
                    <span className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Disponibile domani
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Gift className="h-5 w-5" />
                      Gira la Ruota!
                    </span>
                  )}
                </Button>

                {!canSpin && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                    Puoi girare la ruota una volta al giorno
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quizzes Tab */}
          <TabsContent value="quizzes" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {quizzes.map((quiz) => {
                const progress = quizProgress[quiz.id] || 0
                const isActive = selectedQuiz === quiz.id

                return (
                  <Card key={quiz.id} className={`transition-all ${isActive ? 'ring-2 ring-sky-500' : ''}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            <HelpCircle className="h-5 w-5 text-sky-500" />
                            {quiz.title}
                          </CardTitle>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                            {quiz.description}
                          </p>
                        </div>
                        {quiz.completed && (
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-400">
                            Domande completate
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {progress} / {quiz.questions}
                          </span>
                        </div>
                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-sky-500 to-blue-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${(progress / quiz.questions) * 100}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>

                      {/* Rewards */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                          <Coins className="h-4 w-4" />
                          <span className="font-semibold">{quiz.rewardCoins} monete</span>
                        </div>
                        <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                          <Gift className="h-4 w-4" />
                          <span className="font-semibold">Outfit speciale</span>
                        </div>
                      </div>

                      {/* Actions */}
                      {quiz.completed ? (
                        <Button disabled variant="outline" className="w-full">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Completato
                        </Button>
                      ) : isActive ? (
                        <div className="space-y-2">
                          {/* Mockup Quiz Questions */}
                          {progress < quiz.questions && (
                            <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-lg border border-sky-200 dark:border-sky-800">
                              <p className="font-semibold text-slate-800 dark:text-slate-200 mb-3">
                                Domanda {progress + 1} / {quiz.questions}
                              </p>
                              <p className="text-slate-600 dark:text-slate-400 mb-4">
                                [Mockup: Domanda del quiz]
                              </p>
                              <div className="space-y-2">
                                {['A', 'B', 'C', 'D'].map((option) => (
                                  <Button
                                    key={option}
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => submitQuizAnswer(quiz.id, progress)}
                                  >
                                    {option}. [Mockup risposta]
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                          <Button
                            variant="ghost"
                            onClick={() => setSelectedQuiz(null)}
                            className="w-full"
                          >
                            Annulla
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => startQuiz(quiz.id)}
                          className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Inizia Quiz
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}

