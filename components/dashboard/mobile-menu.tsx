"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  Home,
  Map,
  User,
  Calendar,
  MessageSquare,
  Image as ImageIcon,
  Trophy,
  Settings,
  LogOut,
  X,
  type LucideIcon,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useLanguage } from '@/components/providers/language-provider'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'dashboard.feed', section: 'Home' },
  { href: '/dashboard/map', icon: Map, label: 'dashboard.map', section: 'Mappa' },
  { href: '/dashboard/events', icon: Calendar, label: 'dashboard.events', section: 'Opportunità' },
  { href: '/dashboard/messages', icon: MessageSquare, label: 'dashboard.messages', section: 'Inbox' },
  { href: '/dashboard/profile', icon: User, label: 'dashboard.profile', section: 'Profilo' },
  { href: '/dashboard/portfolio', icon: ImageIcon, label: 'dashboard.portfolio', section: 'Portfolio' },
  { href: '/dashboard/quests', icon: Trophy, label: 'dashboard.quests', section: 'Missioni' },
]

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useLanguage()

  const handleLogout = () => {
    signOut({ callbackUrl: '/' })
  }

  const handleLinkClick = (href: string) => {
    router.push(href)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
                 {/* Backdrop */}
                 <motion.div
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   transition={{ duration: 0.2 }}
                   className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] md:hidden"
                   onClick={onClose}
                 />

                 {/* Menu */}
                 <motion.div
                   initial={{ x: '-100%' }}
                   animate={{ x: 0 }}
                   exit={{ x: '-100%' }}
                   transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                   className="fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-900 shadow-2xl z-[95] md:hidden flex flex-col"
                 >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-sky-200 dark:border-sky-800">
              <h1 className="text-2xl font-black bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                Vybes
              </h1>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors"
              >
                <X className="h-6 w-6 text-slate-700 dark:text-slate-300" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)

                return (
                  <button
                    key={item.href}
                    onClick={() => handleLinkClick(item.href)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left",
                      isActive
                        ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30"
                        : "text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                    )}
                  >
                    <Icon size={24} />
                    <span className="font-semibold">{t(item.label) || item.section}</span>
                  </button>
                )
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-sky-200 dark:border-sky-800 space-y-2">
              <button
                onClick={() => handleLinkClick('/dashboard/settings')}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left",
                  pathname === '/dashboard/settings'
                    ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30"
                    : "text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                )}
              >
                <Settings size={24} />
                <span className="font-semibold">{t('common.settings') || 'Impostazioni'}</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30 hover:from-sky-600 hover:to-blue-700 transition-all"
              >
                <LogOut size={24} />
                <span className="font-semibold">{t('common.logout') || 'Logout'}</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

