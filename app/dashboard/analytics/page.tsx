"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import {
  BarChart3,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Users,
  UserPlus,
  ArrowUp,
  ArrowDown,
  Sparkles,
} from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface Analytics {
  overview: {
    totalPosts: number
    totalLikes: number
    totalComments: number
    totalSaves: number
    totalReactions: number
    totalReposts: number
    totalViews: number
    followers: number
    following: number
    profileVisits: number
    engagementRate: string
  }
  topPosts: {
    id: string
    content: string
    engagement: number
    views: number
    createdAt: string
  }[]
  trends: {
    likes: string
    followers: string
    views: string
  }
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "authenticated") {
      fetchAnalytics()
    }
  }, [status])

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics")
      if (res.ok) {
        const data = await res.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (status === "unauthenticated") redirect("/auth")

  if (loading || !analytics) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const stats = [
    { label: "Post Totali", value: analytics.overview.totalPosts, icon: BarChart3, color: "sky" },
    { label: "Like Ricevuti", value: analytics.overview.totalLikes, icon: Heart, color: "red", trend: analytics.trends.likes },
    { label: "Commenti", value: analytics.overview.totalComments, icon: MessageCircle, color: "blue" },
    { label: "Salvataggi", value: analytics.overview.totalSaves, icon: Bookmark, color: "amber" },
    { label: "Visualizzazioni", value: analytics.overview.totalViews, icon: Eye, color: "purple", trend: analytics.trends.views },
    { label: "Repost", value: analytics.overview.totalReposts, icon: Share2, color: "green" },
    { label: "Follower", value: analytics.overview.followers, icon: Users, color: "pink", trend: analytics.trends.followers },
    { label: "Visite Profilo", value: analytics.overview.profileVisits, icon: UserPlus, color: "orange" },
  ]

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl text-white">
          <BarChart3 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-500">Panoramica delle tue statistiche</p>
        </div>
      </div>

      {/* Main stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={cn(
                "p-2 rounded-lg",
                `bg-${stat.color}-100 dark:bg-${stat.color}-900/30`
              )}>
                <stat.icon className={cn("h-5 w-5", `text-${stat.color}-500`)} />
              </div>
              {stat.trend && (
                <span className={cn(
                  "text-xs font-medium flex items-center gap-0.5",
                  stat.trend.startsWith("+") ? "text-green-500" : "text-red-500"
                )}>
                  {stat.trend.startsWith("+") ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  {stat.trend}
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Engagement rate */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm">Tasso di Engagement</p>
            <p className="text-4xl font-bold mt-1">{analytics.overview.engagementRate}%</p>
          </div>
          <div className="p-4 bg-white/20 rounded-xl">
            <TrendingUp className="h-8 w-8" />
          </div>
        </div>
        <p className="text-white/70 text-sm mt-4">
          Calcolato su like e commenti rispetto ai tuoi follower
        </p>
      </motion.div>

      {/* Top posts */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Top Post
          </h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {analytics.topPosts.length > 0 ? (
            analytics.topPosts.map((post, i) => (
              <div key={post.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <span className="text-2xl font-bold text-gray-300 dark:text-gray-600 w-8">
                  #{i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 dark:text-white truncate">
                    {post.content || "Post senza testo"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString("it-IT")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">{post.engagement}</p>
                  <p className="text-xs text-gray-500">interazioni</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              Nessun post ancora. Inizia a pubblicare!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}





"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import {
  BarChart3,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Users,
  UserPlus,
  ArrowUp,
  ArrowDown,
  Sparkles,
} from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface Analytics {
  overview: {
    totalPosts: number
    totalLikes: number
    totalComments: number
    totalSaves: number
    totalReactions: number
    totalReposts: number
    totalViews: number
    followers: number
    following: number
    profileVisits: number
    engagementRate: string
  }
  topPosts: {
    id: string
    content: string
    engagement: number
    views: number
    createdAt: string
  }[]
  trends: {
    likes: string
    followers: string
    views: string
  }
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "authenticated") {
      fetchAnalytics()
    }
  }, [status])

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics")
      if (res.ok) {
        const data = await res.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (status === "unauthenticated") redirect("/auth")

  if (loading || !analytics) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const stats = [
    { label: "Post Totali", value: analytics.overview.totalPosts, icon: BarChart3, color: "sky" },
    { label: "Like Ricevuti", value: analytics.overview.totalLikes, icon: Heart, color: "red", trend: analytics.trends.likes },
    { label: "Commenti", value: analytics.overview.totalComments, icon: MessageCircle, color: "blue" },
    { label: "Salvataggi", value: analytics.overview.totalSaves, icon: Bookmark, color: "amber" },
    { label: "Visualizzazioni", value: analytics.overview.totalViews, icon: Eye, color: "purple", trend: analytics.trends.views },
    { label: "Repost", value: analytics.overview.totalReposts, icon: Share2, color: "green" },
    { label: "Follower", value: analytics.overview.followers, icon: Users, color: "pink", trend: analytics.trends.followers },
    { label: "Visite Profilo", value: analytics.overview.profileVisits, icon: UserPlus, color: "orange" },
  ]

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl text-white">
          <BarChart3 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-500">Panoramica delle tue statistiche</p>
        </div>
      </div>

      {/* Main stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={cn(
                "p-2 rounded-lg",
                `bg-${stat.color}-100 dark:bg-${stat.color}-900/30`
              )}>
                <stat.icon className={cn("h-5 w-5", `text-${stat.color}-500`)} />
              </div>
              {stat.trend && (
                <span className={cn(
                  "text-xs font-medium flex items-center gap-0.5",
                  stat.trend.startsWith("+") ? "text-green-500" : "text-red-500"
                )}>
                  {stat.trend.startsWith("+") ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  {stat.trend}
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Engagement rate */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm">Tasso di Engagement</p>
            <p className="text-4xl font-bold mt-1">{analytics.overview.engagementRate}%</p>
          </div>
          <div className="p-4 bg-white/20 rounded-xl">
            <TrendingUp className="h-8 w-8" />
          </div>
        </div>
        <p className="text-white/70 text-sm mt-4">
          Calcolato su like e commenti rispetto ai tuoi follower
        </p>
      </motion.div>

      {/* Top posts */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Top Post
          </h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {analytics.topPosts.length > 0 ? (
            analytics.topPosts.map((post, i) => (
              <div key={post.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <span className="text-2xl font-bold text-gray-300 dark:text-gray-600 w-8">
                  #{i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 dark:text-white truncate">
                    {post.content || "Post senza testo"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString("it-IT")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">{post.engagement}</p>
                  <p className="text-xs text-gray-500">interazioni</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              Nessun post ancora. Inizia a pubblicare!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}







