"use client"

import { useState, useEffect } from "react"
import { Gift, Coins, Sparkles, Check, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface Reward {
  day: number
  xpReward: number
  coinReward: number
  isCurrent: boolean
  isClaimed: boolean
}

interface DailyRewardModalProps {
  isOpen: boolean
  onClose: () => void
}

export function DailyRewardModal({ isOpen, onClose }: DailyRewardModalProps) {
  const { toast } = useToast()
  const [rewards, setRewards] = useState<Reward[]>([])
  const [canClaim, setCanClaim] = useState(false)
  const [currentStreak, setCurrentStreak] = useState(1)
  const [claiming, setClaiming] = useState(false)
  const [claimed, setClaimed] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchRewards()
    }
  }, [isOpen])

  const fetchRewards = async () => {
    try {
      const res = await fetch("/api/daily-reward")
      if (res.ok) {
        const data = await res.json()
        setRewards(data.rewards)
        setCanClaim(data.canClaim)
        setCurrentStreak(data.currentStreak)
      }
    } catch (error) {
      console.error("Error fetching rewards:", error)
    }
  }

  const handleClaim = async () => {
    setClaiming(true)
    try {
      const res = await fetch("/api/daily-reward", { method: "POST" })
      if (res.ok) {
        const data = await res.json()
        setClaimed(true)
        setCanClaim(false)
        toast({
          title: "🎉 Premio riscattato!",
          description: `+${data.reward.xpReward} XP, +${data.reward.coinReward} monete`,
        })
        setTimeout(() => {
          fetchRewards()
          setClaimed(false)
        }, 2000)
      }
    } catch (error) {
      toast({ title: "Errore", variant: "destructive" })
    } finally {
      setClaiming(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/patterns/sparkles.svg')] opacity-20" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="relative flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Gift className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Premio Giornaliero</h2>
                <p className="text-white/80 text-sm">
                  Streak: {currentStreak} {currentStreak === 1 ? "giorno" : "giorni"} 🔥
                </p>
              </div>
            </div>
          </div>

          {/* Rewards grid */}
          <div className="p-6">
            <div className="grid grid-cols-7 gap-2 mb-6">
              {rewards.map((reward) => (
                <motion.div
                  key={reward.day}
                  whileHover={{ scale: 1.05 }}
                  className={cn(
                    "relative aspect-square rounded-xl flex flex-col items-center justify-center p-1 border-2 transition-all",
                    reward.isClaimed
                      ? "bg-green-100 dark:bg-green-900/30 border-green-500"
                      : reward.isCurrent && canClaim
                      ? "bg-amber-100 dark:bg-amber-900/30 border-amber-500 animate-pulse"
                      : reward.day < (rewards.find(r => r.isCurrent)?.day || 1)
                      ? "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                      : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                  )}
                >
                  {reward.isClaimed && (
                    <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 rounded-xl">
                      <Check className="h-6 w-6 text-green-500" />
                    </div>
                  )}
                  <span className="text-[10px] font-bold text-gray-500">G{reward.day}</span>
                  <Coins className="h-4 w-4 text-amber-500" />
                  <span className="text-[10px] font-medium">{reward.coinReward}</span>
                </motion.div>
              ))}
            </div>

            {/* Current reward details */}
            {canClaim && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Premio di oggi</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1 font-bold text-amber-600">
                        <Sparkles className="h-4 w-4" />
                        {rewards.find(r => r.isCurrent)?.xpReward} XP
                      </span>
                      <span className="flex items-center gap-1 font-bold text-amber-600">
                        <Coins className="h-4 w-4" />
                        {rewards.find(r => r.isCurrent)?.coinReward} Monete
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Claim button */}
            <Button
              onClick={handleClaim}
              disabled={!canClaim || claiming}
              className={cn(
                "w-full h-12 text-lg font-bold rounded-xl transition-all",
                canClaim
                  ? "bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 hover:opacity-90"
                  : "bg-gray-300 dark:bg-gray-700"
              )}
            >
              {claimed ? (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2"
                >
                  <Check className="h-5 w-5" /> Riscattato!
                </motion.span>
              ) : canClaim ? (
                "Riscatta Premio"
              ) : (
                "Torna domani!"
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}



