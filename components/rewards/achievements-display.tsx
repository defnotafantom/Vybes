"use client"

import { useState, useEffect } from "react"
import { Trophy, Lock, Sparkles, Star } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: string
  xpReward: number
  rarity: string
  unlocked: boolean
  unlockedAt: string | null
}

const RARITY_COLORS = {
  common: "from-gray-400 to-gray-500",
  rare: "from-blue-400 to-blue-600",
  epic: "from-purple-400 to-purple-600",
  legendary: "from-amber-400 to-orange-500",
}

const CATEGORY_LABELS: Record<string, string> = {
  social: "Social",
  creative: "Creatività",
  engagement: "Engagement",
  special: "Speciali",
}

export function AchievementsDisplay() {
  const [achievements, setAchievements] = useState<Record<string, Achievement[]>>({})
  const [total, setTotal] = useState(0)
  const [unlocked, setUnlocked] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    fetchAchievements()
  }, [])

  const fetchAchievements = async () => {
    try {
      const res = await fetch("/api/achievements")
      if (res.ok) {
        const data = await res.json()
        setAchievements(data.achievements)
        setTotal(data.total)
        setUnlocked(data.unlocked)
      }
    } catch (error) {
      console.error("Error fetching achievements:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const categories = Object.keys(achievements)
  const displayAchievements = selectedCategory 
    ? achievements[selectedCategory] || []
    : Object.values(achievements).flat()

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl text-white">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Achievements</h2>
            <p className="text-sm text-gray-500">
              {unlocked} / {total} sbloccati
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-amber-500">
            {total > 0 ? Math.round((unlocked / total) * 100) : 0}%
          </div>
          <div className="text-xs text-gray-500">Completamento</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${total > 0 ? (unlocked / total) * 100 : 0}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
        />
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
            selectedCategory === null
              ? "bg-sky-500 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          )}
        >
          Tutti
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
              selectedCategory === cat
                ? "bg-sky-500 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            )}
          >
            {CATEGORY_LABELS[cat] || cat}
          </button>
        ))}
      </div>

      {/* Achievements grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {displayAchievements.map((achievement) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className={cn(
              "relative rounded-xl p-4 border-2 transition-all overflow-hidden",
              achievement.unlocked
                ? "bg-white dark:bg-gray-800 border-amber-400"
                : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 opacity-60"
            )}
          >
            {/* Rarity indicator */}
            <div className={cn(
              "absolute top-0 right-0 w-16 h-16 -mr-8 -mt-8 rounded-full bg-gradient-to-br",
              RARITY_COLORS[achievement.rarity as keyof typeof RARITY_COLORS] || RARITY_COLORS.common
            )} />

            <div className="relative">
              {/* Icon */}
              <div className={cn(
                "text-3xl mb-2",
                !achievement.unlocked && "grayscale"
              )}>
                {achievement.icon}
              </div>

              {/* Name */}
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
                {achievement.unlocked ? achievement.name : "???"}
              </h3>

              {/* Description */}
              <p className="text-xs text-gray-500 line-clamp-2">
                {achievement.unlocked ? achievement.description : "Achievement bloccato"}
              </p>

              {/* Reward */}
              <div className="flex items-center gap-1 mt-2 text-xs">
                <Sparkles className="h-3 w-3 text-amber-500" />
                <span className="text-amber-600 font-medium">+{achievement.xpReward} XP</span>
              </div>

              {/* Lock overlay */}
              {!achievement.unlocked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}





