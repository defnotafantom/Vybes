"use client"

import React from "react"
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
    <div className="flex items-center gap-1.5 flex-nowrap min-w-max">
      {artTags.map((tag) => {
        const isSelected = selectedTags.includes(tag.name)
        return (
          <button
            key={tag.id}
            onClick={() => toggleTag?.(tag.name)}
            className={cn(
              "px-2.5 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap",
              isSelected
                ? "bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
          >
            {tag.name}
          </button>
        )
      })}
      {selectedTags.length > 0 && clearAll && (
        <button
          onClick={clearAll}
          className="px-2 py-1 text-xs text-gray-400 hover:text-red-500"
        >
          ×
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

