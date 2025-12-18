"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  Gift,
  Shield,
  BarChart3,
  type LucideIcon,
} from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { useLanguage } from '@/components/providers/language-provider'
import Image from 'next/image'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'dashboard.feed', section: 'Home' },
  { href: '/dashboard/map', icon: Map, label: 'dashboard.map', section: 'Mappa' },
  { href: '/dashboard/events', icon: Calendar, label: 'dashboard.events', section: 'Opportunità' },
  { href: '/dashboard/messages', icon: MessageSquare, label: 'dashboard.messages', section: 'Inbox' },
  { href: '/dashboard/profile', icon: User, label: 'dashboard.profile', section: 'Profilo' },
  { href: '/dashboard/analytics', icon: BarChart3, label: 'dashboard.analytics', section: 'Analytics' },
  { href: '/dashboard/quests', icon: Trophy, label: 'dashboard.quests', section: 'Missioni' },
  { href: '/dashboard/minigames', icon: Gift, label: 'dashboard.minigames', section: 'Minigames' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const { data: session } = useSession()
  const [hover, setHover] = useState(false)
  
  // Check if user has admin access
  const adminRole = session?.user?.adminRole
  const hasAdminAccess = adminRole && ['MODERATOR', 'ADMIN', 'SUPERADMIN'].includes(adminRole)

  const renderButton = (
    IconComponent: LucideIcon,
    label: string,
    href: string,
    onClick?: () => void,
    isActive = false,
    bgColor: string | null = null
  ) => {
    const ButtonContent = (
      <motion.div
        className="flex items-center w-full"
        initial={false}
        animate={{ justifyContent: hover ? "flex-start" : "center" }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex-shrink-0 flex justify-center items-center w-12">
          <IconComponent size={24} />
        </div>
        <AnimatePresence>
          {hover && (
            <motion.div
              initial={{ opacity: 0, width: 0, marginLeft: 0 }}
              animate={{ opacity: 1, width: "auto", marginLeft: 14 }}
              exit={{ opacity: 0, width: 0, marginLeft: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden font-bold flex items-center h-full whitespace-nowrap"
            >
              {label}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )

    if (href === '#') {
      return (
        <motion.button
          key={label}
          whileHover={{ scale: 1.05 }}
          onClick={onClick}
          aria-label={label}
          className={cn(
            "flex items-center h-12 rounded-xl w-full px-3 transition-all duration-200 mb-1.5",
            bgColor || (isActive
              ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30"
              : "bg-white/50 dark:bg-gray-800/50 text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-gray-800/80 border border-transparent hover:border-sky-200/50 dark:hover:border-sky-800/50")
          )}
        >
          {ButtonContent}
        </motion.button>
      )
    }

    return (
      <motion.div
        key={label}
        whileHover={{ scale: 1.05 }}
        className="mb-2"
      >
        <Link
          href={href}
          onClick={onClick}
          aria-label={label}
          aria-current={isActive ? 'page' : undefined}
          data-guide={
            href === '/dashboard/map'
              ? 'nav-map'
              : href === '/dashboard/messages'
                ? 'nav-messages'
                : undefined
          }
          className={cn(
            "flex items-center h-12 rounded-xl w-full px-3 transition-all duration-200",
            bgColor
              ? bgColor
              : isActive
              ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30"
              : "bg-white/50 dark:bg-gray-800/50 text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-gray-800/80 border border-transparent hover:border-sky-200/50 dark:hover:border-sky-800/50"
          )}
        >
          {ButtonContent}
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.aside
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      initial={{ width: 72 }}
      animate={{ width: hover ? 256 : 72 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      role="navigation"
      aria-label="Menu principale"
      className="hidden md:flex h-full bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl shadow-xl flex flex-col justify-between rounded-tr-2xl rounded-br-2xl border-r border-white/40 dark:border-gray-700/40 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex flex-col items-center py-8">
        <motion.div
          animate={{ 
            scale: hover ? 1.15 : 1,
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative flex items-center justify-center"
        >
          <Image
            src="https://i.imgur.com/gGwB8VE.png"
            alt="Vybes Logo"
            width={hover ? 180 : 56}
            height={hover ? 90 : 56}
            className={cn(
              "object-contain drop-shadow-2xl transition-all duration-300",
              hover ? "w-44 h-20" : "w-14 h-14"
            )}
            priority
            quality={100}
          />
        </motion.div>
        <AnimatePresence>
          {hover && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 overflow-hidden"
            >
              <h1 className="text-2xl font-black bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                Vybes
              </h1>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Menu Buttons */}
      <nav className="flex flex-col flex-1 justify-center gap-2 px-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          // Per /dashboard, è attivo solo se è esattamente /dashboard (non se inizia con /dashboard/)
          // Per gli altri, controlla se il pathname corrisponde esattamente o inizia con l'href
          const isActive = item.href === '/dashboard' 
            ? pathname === '/dashboard' 
            : pathname === item.href || (pathname?.startsWith(`${item.href}/`) && pathname !== '/dashboard')
          
          return renderButton(
            Icon,
            t(item.label) || item.section,
            item.href,
            undefined,
            isActive
          )
        })}
      </nav>

      {/* Settings & Logout */}
      <div className="px-2 pb-4 space-y-2">
        {/* Hidden Admin Panel - only visible to admins */}
        {hasAdminAccess && renderButton(
          Shield,
          'Admin Panel',
          '/dashboard/admin',
          undefined,
          pathname?.startsWith('/dashboard/admin'),
          "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30"
        )}
        {renderButton(
          Settings,
          t('common.settings') || 'Impostazioni',
          '/dashboard/settings',
          undefined,
          pathname === '/dashboard/settings'
        )}
        {renderButton(
          LogOut,
          t('common.logout') || 'Logout',
          '#',
          () => signOut({ callbackUrl: '/' }),
          false,
          "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30"
        )}
      </div>
    </motion.aside>
  )
}

