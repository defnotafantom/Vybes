"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Hash, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

interface TrendingTag {
  tag: string
  count: number
}

interface TrendingUser {
  id: string
  name: string | null
  username: string | null
  image: string | null
  _count: {
    posts: number
    followers: number
  }
}

interface TrendingSidebarProps {
  onTagClick?: (tag: string) => void
}

export function TrendingSidebar({ onTagClick }: TrendingSidebarProps) {
  const [tags, setTags] = useState<TrendingTag[]>([])
  const [users, setUsers] = useState<TrendingUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrending()
  }, [])

  const fetchTrending = async () => {
    try {
      const res = await fetch("/api/trending")
      if (res.ok) {
        const data = await res.json()
        setTags(data.tags || [])
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error("Error fetching trending:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 flex justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-sky-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Trending Tags */}
      <div className="glass-card p-4">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-sky-500" />
          Trending
        </h3>
        
        {tags.length === 0 ? (
          <p className="text-sm text-gray-500">Nessun trend al momento</p>
        ) : (
          <div className="space-y-3">
            {tags.map((item, idx) => (
              <motion.button
                key={item.tag}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onTagClick?.(item.tag)}
                className="w-full flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl p-2 transition-colors text-left"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <Hash className="h-4 w-4 text-sky-500" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {item.tag}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{item.count} post</span>
                </div>
                <span className="text-xs font-medium text-sky-500">#{idx + 1}</span>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Suggested Users */}
      {users.length > 0 && (
        <div className="glass-card p-4">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">
            Creator da seguire
          </h3>
          
          <div className="space-y-3">
            {users.map((user, idx) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link
                  href={`/dashboard/users/${user.id}`}
                  className="flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl p-2 transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.image || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-sky-400 to-blue-500 text-white">
                      {(user.name || user.username || "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {user.name || user.username}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user._count.followers} follower • {user._count.posts} post
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

