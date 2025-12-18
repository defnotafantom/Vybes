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
    <div className="inline-flex items-center p-1 rounded-xl bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm">
      {modes.map((mode) => {
        const Icon = mode.icon
        const isActive = viewMode === mode.id
        return (
          <button
            key={mode.id}
            onClick={() => setViewMode(mode.id)}
            className={cn(
              "relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              isActive
                ? "text-white"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg shadow-lg"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Icon size={16} />
              <span className="hidden sm:inline">{mode.label}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

