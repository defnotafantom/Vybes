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
    <div className="flex flex-wrap items-center gap-2">
      {artTags.map((tag) => {
        const isSelected = selectedTags.includes(tag.name)

        return (
          <motion.button
            key={tag.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toggleTag?.(tag.name)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1",
              isSelected
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/25"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            )}
          >
            #{tag.name}
            {tag.name === "Musica" && <Music size={12} />}
          </motion.button>
        )
      })}

      {selectedTags.length > 0 && clearAll && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={clearAll}
          className="px-3 py-1.5 rounded-full text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          ✕ Pulisci
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

