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
    { id: "cover", icon: LayoutGrid, label: "Cover" },
    { id: "social", icon: LayoutList, label: "Social" },
    { id: "masonry", icon: Layout, label: "Masonry" },
    { id: "threads", icon: MessageSquare, label: "Threads" },
  ]

  return (
    <div className="flex items-center gap-2 flex-wrap justify-center">
      {modes.map((mode) => {
        const Icon = mode.icon
        return (
          <button
            key={mode.id}
            onClick={() => setViewMode(mode.id)}
            className={cn(
              "p-2 rounded-xl transition-all duration-200 hover:scale-110",
              viewMode === mode.id
                ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30"
                : "bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm text-slate-600 dark:text-slate-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 border border-sky-200 dark:border-sky-800"
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

