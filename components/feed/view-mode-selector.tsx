"use client"

import React from "react"
import { LayoutGrid, LayoutList, Layout, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

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
    <div className="flex items-center gap-1 p-1 bg-gray-100/80 dark:bg-gray-800/80 rounded-xl">
      {modes.map((mode) => {
        const Icon = mode.icon
        const isActive = viewMode === mode.id
        return (
          <button
            key={mode.id}
            onClick={() => setViewMode(mode.id)}
            className={cn(
              "p-2 rounded-lg transition-all duration-200",
              isActive
                ? "bg-white dark:bg-gray-700 text-sky-600 dark:text-sky-400 shadow-sm"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            )}
            title={mode.label}
          >
            <Icon size={18} />
          </button>
        )
      })}
    </div>
  )
}

