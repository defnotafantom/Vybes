"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Trophy, CheckCircle, Circle, Star } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface Quest {
  id: string
  title: string
  description: string
  type: string
  experienceReward: number
  reputationReward: number
  progress: {
    progress: number
    maxProgress: number
    completed: boolean
    completedAt: Date | null
  } | null
}

export default function QuestsPage() {
  const { data: session } = useSession()
  const [quests, setQuests] = useState<Quest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuests()
  }, [])

  const fetchQuests = async () => {
    try {
      const response = await fetch('/api/quests')
      if (response.ok) {
        const data = await response.json()
        setQuests(data)
      }
    } catch (error) {
      console.error('Error fetching quests:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Caricamento missioni...</div>
  }

  const completedQuests = quests.filter(q => q.progress?.completed)
  const activeQuests = quests.filter(q => q.progress && !q.progress.completed)
  const availableQuests = quests.filter(q => !q.progress)

  return (
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-6 w-full px-2">
      <div>
        <h1 className="text-3xl font-black bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
          Missioni
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Completa le missioni per guadagnare esperienza e aumentare la tua reputazione
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800 shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Trophy className="h-10 w-10 text-yellow-500 fill-yellow-500" />
              <div>
                <div className="text-3xl font-black text-slate-800 dark:text-slate-100">{completedQuests.length}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Completate</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Circle className="h-10 w-10 text-blue-500 fill-blue-500" />
              <div>
                <div className="text-3xl font-black text-slate-800 dark:text-slate-100">{activeQuests.length}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">In Corso</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Circle className="h-10 w-10 text-slate-400" />
              <div>
                <div className="text-3xl font-black text-slate-800 dark:text-slate-100">{availableQuests.length}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Disponibili</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Quests */}
      {activeQuests.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Missioni in Corso
          </h2>
          <div className="space-y-4">
            {activeQuests.map((quest) => (
              <Card 
                key={quest.id}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-all hover:scale-[1.01]"
              >
                <CardHeader className="bg-gradient-to-r from-blue-100/50 to-indigo-100/50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-t-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                        <Circle className="h-5 w-5 text-blue-500 fill-blue-500" />
                        {quest.title}
                      </CardTitle>
                      <CardDescription className="mt-2 text-slate-600 dark:text-slate-400">
                        {quest.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2 text-slate-700 dark:text-slate-300">
                      <span className="font-medium">Progresso</span>
                      <span className="font-semibold">
                        {quest.progress!.progress} / {quest.progress!.maxProgress}
                      </span>
                    </div>
                    <Progress
                      value={(quest.progress!.progress / quest.progress!.maxProgress) * 100}
                      className="h-3 bg-blue-100 dark:bg-blue-900/30"
                    />
                  </div>
                  <div className="flex gap-6 text-sm pt-2">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                      <Trophy className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      <span className="text-slate-700 dark:text-slate-300">
                        <span className="font-semibold text-yellow-600 dark:text-yellow-400">+{quest.experienceReward} XP</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <Star className="h-4 w-4 text-blue-600 dark:text-blue-400 fill-blue-600 dark:fill-blue-400" />
                      <span className="text-slate-700 dark:text-slate-300">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">+{quest.reputationReward}</span>
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Quests */}
      {availableQuests.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-slate-600 to-gray-600 bg-clip-text text-transparent">
            Missioni Disponibili
          </h2>
          <div className="space-y-4">
            {availableQuests.map((quest) => (
              <Card 
                key={quest.id}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-sky-100 dark:border-sky-900 shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] group"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                        <Circle className="h-5 w-5 text-slate-400 group-hover:text-sky-500 transition-colors" />
                        {quest.title}
                      </CardTitle>
                      <CardDescription className="mt-2 text-slate-600 dark:text-slate-400">
                        {quest.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-6 text-sm">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                      <Trophy className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      <span className="text-slate-700 dark:text-slate-300">
                        <span className="font-semibold text-yellow-600 dark:text-yellow-400">+{quest.experienceReward} XP</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <Star className="h-4 w-4 text-blue-600 dark:text-blue-400 fill-blue-600 dark:fill-blue-400" />
                      <span className="text-slate-700 dark:text-slate-300">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">+{quest.reputationReward}</span>
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Completed Quests */}
      {completedQuests.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Missioni Completate
          </h2>
          <div className="space-y-4">
            {completedQuests.map((quest) => (
              <Card 
                key={quest.id} 
                className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800 shadow-lg opacity-90 hover:opacity-100 transition-all hover:scale-[1.01]"
              >
                <CardHeader className="bg-gradient-to-r from-green-100/50 to-emerald-100/50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-t-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                        <CheckCircle className="h-5 w-5 text-green-500 fill-green-500" />
                        {quest.title}
                      </CardTitle>
                      <CardDescription className="mt-2 text-slate-600 dark:text-slate-400">
                        {quest.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {quest.progress?.completedAt && (
                    <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Completata il {new Date(quest.progress.completedAt).toLocaleDateString('it-IT')}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

