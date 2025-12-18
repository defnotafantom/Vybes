"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const REACTIONS = [
  { emoji: "❤️", label: "Love" },
  { emoji: "😂", label: "Haha" },
  { emoji: "😮", label: "Wow" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😡", label: "Angry" },
  { emoji: "🔥", label: "Fire" },
  { emoji: "👏", label: "Clap" },
  { emoji: "💯", label: "100" },
]

interface ReactionCount {
  emoji: string
  count: number
}

interface ReactionsPickerProps {
  postId: string
  reactions: ReactionCount[]
  userReactions: string[]
  onReact: (emoji: string) => void
  compact?: boolean
}

export function ReactionsPicker({
  postId,
  reactions,
  userReactions,
  onReact,
  compact = false,
}: ReactionsPickerProps) {
  const [showPicker, setShowPicker] = useState(false)
  const [hoveredEmoji, setHoveredEmoji] = useState<string | null>(null)

  const totalReactions = reactions.reduce((sum, r) => sum + r.count, 0)

  return (
    <div className="relative">
      {/* Reaction button and counts */}
      <div className="flex items-center gap-1">
        <button
          onMouseEnter={() => setShowPicker(true)}
          onMouseLeave={() => setShowPicker(false)}
          onClick={() => setShowPicker(!showPicker)}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full transition-all",
            userReactions.length > 0
              ? "bg-sky-100 dark:bg-sky-900/30 text-sky-600"
              : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
          )}
        >
          {/* Show top 3 reactions or default heart */}
          {reactions.length > 0 ? (
            <span className="flex -space-x-1">
              {reactions.slice(0, 3).map((r) => (
                <span key={r.emoji} className="text-sm">
                  {r.emoji}
                </span>
              ))}
            </span>
          ) : (
            <span className="text-sm">❤️</span>
          )}
          {totalReactions > 0 && (
            <span className="text-xs font-medium">{totalReactions}</span>
          )}
        </button>

        {/* Picker popup */}
        <AnimatePresence>
          {showPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              onMouseEnter={() => setShowPicker(true)}
              onMouseLeave={() => setShowPicker(false)}
              className="absolute bottom-full left-0 mb-2 p-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex gap-1 z-50"
            >
              {REACTIONS.map((reaction) => (
                <motion.button
                  key={reaction.emoji}
                  whileHover={{ scale: 1.3, y: -5 }}
                  whileTap={{ scale: 0.9 }}
                  onMouseEnter={() => setHoveredEmoji(reaction.emoji)}
                  onMouseLeave={() => setHoveredEmoji(null)}
                  onClick={() => {
                    onReact(reaction.emoji)
                    setShowPicker(false)
                  }}
                  className={cn(
                    "text-2xl p-1 rounded-lg transition-colors relative",
                    userReactions.includes(reaction.emoji) && "bg-sky-100 dark:bg-sky-900/30"
                  )}
                >
                  {reaction.emoji}
                  {hoveredEmoji === reaction.emoji && (
                    <motion.span
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded whitespace-nowrap"
                    >
                      {reaction.label}
                    </motion.span>
                  )}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Compact display of reactions under post
export function ReactionsDisplay({ reactions }: { reactions: ReactionCount[] }) {
  if (reactions.length === 0) return null

  return (
    <div className="flex items-center gap-1 text-xs text-gray-500">
      <span className="flex -space-x-0.5">
        {reactions.slice(0, 5).map((r) => (
          <span key={r.emoji}>{r.emoji}</span>
        ))}
      </span>
      <span>{reactions.reduce((sum, r) => sum + r.count, 0)}</span>
    </div>
  )
}
