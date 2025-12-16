"use client"

import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { it } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'

interface Notification {
  id: string
  type: string
  title: string
  content: string
  link: string | null
  read: boolean
  createdAt: string
}

export function NotificationBell() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications()
      // Poll for new notifications every 10 seconds
      const interval = setInterval(fetchNotifications, 10000)
      return () => clearInterval(interval)
    }
  }, [session])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications?unread=true')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications.slice(0, 5)) // Show only last 5
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      })
      fetchNotifications()
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    setLoading(true)
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      })
      fetchNotifications()
    } catch (error) {
      console.error('Error marking all as read:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!session?.user?.id) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-sky-50/80 dark:hover:bg-sky-900/30 transition-all"
        >
          <Bell className="h-5 w-5 text-slate-700 dark:text-slate-300" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-1 right-1 h-4 w-4 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold flex items-center justify-center shadow-lg"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-2 border-sky-200/50 dark:border-sky-800/50 shadow-2xl">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifiche</span>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              disabled={loading}
              className="text-xs text-sky-600 dark:text-sky-400 hover:underline"
            >
              Segna tutte come lette
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
              Nessuna notifica
            </div>
          ) : (
            <AnimatePresence>
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <DropdownMenuItem
                    asChild
                    className={`p-3 cursor-pointer ${
                      !notification.read
                        ? 'bg-sky-50/50 dark:bg-sky-900/20 border-l-2 border-sky-500'
                        : ''
                    }`}
                    onSelect={() => {
                      if (!notification.read) {
                        markAsRead(notification.id)
                      }
                    }}
                  >
                    {notification.link ? (
                      <Link href={notification.link} className="w-full">
                        <div className="space-y-1">
                          <div className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                            {notification.title}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                            {notification.content}
                          </div>
                          <div className="text-xs text-slate-400 dark:text-slate-500">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                              locale: it,
                            })}
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <div className="w-full space-y-1">
                        <div className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                          {notification.title}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                          {notification.content}
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-500">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: it,
                          })}
                        </div>
                      </div>
                    )}
                  </DropdownMenuItem>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/notifications" className="w-full text-center justify-center text-sky-600 dark:text-sky-400">
                Vedi tutte le notifiche
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

