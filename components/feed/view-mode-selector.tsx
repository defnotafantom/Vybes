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
    { id: "social", icon: LayoutList },
    { id: "cover", icon: LayoutGrid },
    { id: "masonry", icon: Layout },
    { id: "threads", icon: MessageSquare },
  ]

  return (
    <div className="flex items-center gap-0.5 flex-shrink-0">
      {modes.map((mode) => {
        const Icon = mode.icon
        const isActive = viewMode === mode.id
        return (
          <button
            key={mode.id}
            onClick={() => setViewMode(mode.id)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isActive
                ? "bg-sky-500 text-white"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
            title={mode.id}
          >
            <Icon size={16} />
          </button>
        )
      })}
    </div>
  )
}

