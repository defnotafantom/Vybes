"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Music } from "lucide-react"
import { cn } from "@/lib/utils"

interface Tag {
  id: number | string
  name: string
}

interface TagFiltersProps {
  artTags?: Tag[]
  selectedTags?: string[]
  toggleTag?: (tagName: string) => void
  clearAll?: () => void
}

export function TagFilters({ artTags = [], selectedTags = [], toggleTag, clearAll }: TagFiltersProps) {
  if (!artTags || artTags.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 mt-4 mb-2">
      <AnimatePresence>
        {artTags.map((tag) => {
          const isSelected = selectedTags.includes(tag.name)

          return (
            <motion.button
              key={tag.id}
              layout
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: isSelected ? 1.1 : 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={() => toggleTag?.(tag.name)}
              className={cn(
                "px-3 py-1.5 rounded-xl shadow-md text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 h-8",
                isSelected
                  ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white scale-105 shadow-lg shadow-sky-500/30"
                  : "bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-900/20 border border-sky-200 dark:border-sky-800"
              )}
            >
              <span className="flex items-center gap-1">
                {tag.name}
                {tag.name === "Musica" && (
                  <Music size={14} className={isSelected ? "text-white" : "text-sky-600 dark:text-sky-400"} />
                )}
              </span>
            </motion.button>
          )
        })}
      </AnimatePresence>

      {selectedTags.length > 0 && clearAll && (
        <motion.button
          layout
          onClick={clearAll}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="ml-2 px-3 py-1.5 rounded-xl shadow-md text-sm font-semibold bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-900/20 border border-sky-200 dark:border-sky-800 h-8 transition-all"
        >
          Pulisci
        </motion.button>
      )}
    </div>
  )
}

interface PostTagsProps {
  tags?: string[]
  onTagClick?: (tag: string) => void
}

export function PostTags({ tags = [], onTagClick }: PostTagsProps) {
  if (!tags || tags.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 mt-2">
      {tags.map((tag, index) => (
        <button
          key={index}
          onClick={() => onTagClick?.(tag)}
          className="px-2 py-1 rounded-full text-xs font-semibold bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 hover:bg-sky-200 dark:hover:bg-sky-900/50 flex items-center gap-1 h-6 transition-colors border border-sky-200 dark:border-sky-800"
        >
          {tag}
          {tag === "Musica" && <Music size={12} className="text-sky-600 dark:text-sky-400" />}
        </button>
      ))}
    </div>
  )
}

