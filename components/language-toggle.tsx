"use client"

import * as React from "react"
import { Languages } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-sky-50/80 dark:hover:bg-sky-900/30 hover:scale-110 transition-all shadow-sm hover:shadow-md">
          <Languages className="h-5 w-5 text-sky-600 dark:text-sky-400" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-gradient-to-br from-white/95 via-sky-50/50 to-blue-50/50 dark:from-gray-900/95 dark:via-sky-900/30 dark:to-blue-900/30 backdrop-blur-xl border-2 border-sky-200/50 dark:border-sky-800/50 shadow-2xl">
        <DropdownMenuItem onClick={() => setLanguage('it')} className="hover:bg-sky-50/80 dark:hover:bg-sky-900/30 rounded-lg transition-all font-medium">
          🇮🇹 Italiano
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('en')} className="hover:bg-sky-50/80 dark:hover:bg-sky-900/30 rounded-lg transition-all font-medium">
          🇬🇧 English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

