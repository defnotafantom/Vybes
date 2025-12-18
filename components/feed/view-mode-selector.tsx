"use client"

import React from "react"
import { LayoutGrid, LayoutList, Layout, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface ViewModeSelectorProps {
  viewMode: string
  setViewMode: (mode: string) => void
}

export function ViewModeSelector({ viewMode, setViewMode }: ViewModeSelectorProps) {
  const modes = [
    { id: "social", icon: LayoutList, label: "Social" },
    { id: "cover", icon: LayoutGrid, label: "Cover" },
    { id: "masonry", icon: Layout, label: "Masonry" },
    { id: "threads", icon: MessageSquare, label: "Threads" },
  ]

  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-gray-100/80 dark:bg-gray-800/80 min-w-max">
      {modes.map((mode) => {
        const Icon = mode.icon
        const isActive = viewMode === mode.id
        return (
          <button
            key={mode.id}
            onClick={() => setViewMode(mode.id)}
            className={cn(
              "relative flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap",
              isActive
                ? "text-white"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="viewTab"
                className="absolute inset-0 bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg shadow-md"
                transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Icon size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">{mode.label}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

