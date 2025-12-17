"use client"

import { useState } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { useSession } from 'next-auth/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useLanguage } from '@/components/providers/language-provider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Menu } from 'lucide-react'
import { MobileMenu } from './mobile-menu'
import { AIGuide } from '@/components/ai-guide'

export function DashboardHeader() {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { t } = useLanguage()

  const initials = session?.user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  return (
    <>
      <header className="relative h-16 border-b-2 border-sky-200/50 dark:border-sky-800/50 bg-gradient-to-r from-white/95 via-sky-50/40 to-blue-50/40 dark:from-gray-900/95 dark:via-sky-900/25 dark:to-blue-900/25 backdrop-blur-xl sticky top-0 z-40 shadow-lg shadow-sky-500/5 dark:shadow-sky-900/10">
        {/* Decorative gradient line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-sky-400/60 to-transparent"></div>
        
        <div className="h-full px-4 md:px-6 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl hover:bg-sky-50/80 dark:hover:bg-sky-900/30 transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
            >
              <Menu className="h-6 w-6 text-slate-700 dark:text-slate-300" />
            </button>

            {/* Brand (desktop) */}
            <Link
              href="/dashboard"
              className="hidden md:flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-sky-50/80 dark:hover:bg-sky-900/30 transition-colors"
              aria-label="Vybes Dashboard"
            >
              <span className="text-lg font-black bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                Vybes
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <NotificationBell />
            <div data-guide="header-theme">
              <ThemeToggle />
            </div>
            <div data-guide="header-language">
              <LanguageToggle />
            </div>
            <AIGuide />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button data-guide="header-profile" className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 rounded-xl hover:bg-sky-50/80 dark:hover:bg-sky-900/30 transition-all duration-200 group shadow-sm hover:shadow-md">
                  <Avatar className="ring-2 ring-sky-300 dark:ring-sky-700 group-hover:ring-sky-500 dark:group-hover:ring-sky-500 transition-all h-8 w-8 md:h-10 md:w-10 shadow-md group-hover:shadow-lg group-hover:scale-110">
                    <AvatarImage src={session?.user?.image || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-sky-500 via-sky-600 to-blue-600 text-white font-bold text-xs md:text-sm shadow-lg">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline font-semibold text-slate-700 dark:text-slate-200 text-sm md:text-base group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                    {session?.user?.name || session?.user?.email}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gradient-to-br from-white/95 via-sky-50/50 to-blue-50/50 dark:from-gray-900/95 dark:via-sky-900/30 dark:to-blue-900/30 backdrop-blur-xl border-2 border-sky-200/50 dark:border-sky-800/50 shadow-2xl">
                <DropdownMenuLabel className="text-slate-700 dark:text-slate-200 font-bold">{t('common.myAccount')}</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-sky-300 dark:via-sky-700 to-transparent" />
                <DropdownMenuItem asChild className="hover:bg-sky-50/80 dark:hover:bg-sky-900/30 rounded-lg transition-all">
                  <Link href="/dashboard/profile" className="cursor-pointer font-medium">{t('common.profile')}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="hover:bg-sky-50/80 dark:hover:bg-sky-900/30 rounded-lg transition-all">
                  <Link href="/dashboard/settings" className="cursor-pointer font-medium">{t('common.settings')}</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  )
}

