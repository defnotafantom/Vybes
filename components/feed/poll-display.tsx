"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Check, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { it } from "date-fns/locale"

interface PollOption {
  id: string
  text: string
  votes: number
  percentage: number
}

interface Poll {
  id: string
  question: string
  endsAt: string | null
  options: PollOption[]
  totalVotes: number
  userVote: string | null
}

interface PollDisplayProps {
  postId: string
}

export function PollDisplay({ postId }: PollDisplayProps) {
  const [poll, setPoll] = useState<Poll | null>(null)
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)

  const fetchPoll = useCallback(async () => {
    try {
      const res = await fetch(`/api/posts/${postId}/poll`)
      if (res.ok) {
        const data = await res.json()
        setPoll(data.poll)
      }
    } catch (error) {
      console.error("Error fetching poll:", error)
    } finally {
      setLoading(false)
    }
  }, [postId])

  useEffect(() => {
    fetchPoll()
  }, [fetchPoll])

  const handleVote = async (optionId: string) => {
    if (voting || poll?.userVote) return

    setVoting(true)
    try {
      const res = await fetch(`/api/posts/${postId}/poll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId }),
      })

      if (res.ok) {
        fetchPoll()
      }
    } catch (error) {
      console.error("Error voting:", error)
    } finally {
      setVoting(false)
    }
  }

  if (loading) {
    return (
      <div className="mt-3 space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (!poll) return null

  const isEnded = poll.endsAt && new Date(poll.endsAt) < new Date()
  const showResults = poll.userVote !== null || isEnded

  return (
    <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
      <h4 className="font-medium text-gray-900 dark:text-white mb-3">{poll.question}</h4>

      <div className="space-y-2">
        {poll.options.map((option) => (
          <motion.button
            key={option.id}
            disabled={showResults || voting}
            onClick={() => handleVote(option.id)}
            className={cn(
              "w-full relative rounded-xl overflow-hidden text-left transition-all",
              showResults
                ? "cursor-default"
                : "cursor-pointer hover:ring-2 hover:ring-sky-500"
            )}
            whileHover={!showResults ? { scale: 1.01 } : {}}
            whileTap={!showResults ? { scale: 0.99 } : {}}
          >
            {/* Background bar */}
            {showResults && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${option.percentage}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={cn(
                  "absolute inset-y-0 left-0",
                  poll.userVote === option.id
                    ? "bg-sky-500/20"
                    : "bg-gray-200 dark:bg-gray-700"
                )}
              />
            )}

            <div className="relative px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {poll.userVote === option.id && (
                  <Check className="h-4 w-4 text-sky-500" />
                )}
                <span className={cn(
                  "text-sm",
                  poll.userVote === option.id
                    ? "font-medium text-sky-600 dark:text-sky-400"
                    : "text-gray-700 dark:text-gray-300"
                )}>
                  {option.text}
                </span>
              </div>
              {showResults && (
                <span className="text-sm font-medium text-gray-500">
                  {option.percentage}%
                </span>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
        <span>{poll.totalVotes} vot{poll.totalVotes === 1 ? "o" : "i"}</span>
        {poll.endsAt && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {isEnded
              ? "Terminato"
              : `Termina ${formatDistanceToNow(new Date(poll.endsAt), { addSuffix: true, locale: it })}`
            }
          </span>
        )}
      </div>
    </div>
  )
}

