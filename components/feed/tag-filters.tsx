"use client"

import React from "react"
import { X } from "lucide-react"
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
    <div className="flex items-center gap-2 flex-nowrap min-w-max">
      {artTags.map((tag) => {
        const isSelected = selectedTags.includes(tag.name)
        return (
          <button
            key={tag.id}
            onClick={() => toggleTag?.(tag.name)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap border",
              isSelected
                ? "bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400 shadow-sm"
                : "bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 text-gray-600 dark:text-gray-400 hover:border-sky-300 dark:hover:border-sky-700 hover:text-sky-600 dark:hover:text-sky-400"
            )}
          >
            #{tag.name}
          </button>
        )
      })}
      {selectedTags.length > 0 && clearAll && (
        <button
          onClick={clearAll}
          className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          title="Rimuovi filtri"
        >
          <X size={14} />
        </button>
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
    <div className="flex flex-wrap items-center gap-1.5 mt-2">
      {tags.map((tag, index) => (
        <button
          key={index}
          onClick={() => onTagClick?.(tag)}
          className="text-xs text-sky-500 hover:text-sky-600 dark:text-sky-400"
        >
          #{tag}
        </button>
      ))}
    </div>
  )
}

