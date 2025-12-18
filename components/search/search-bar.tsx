"use client"

import { useState, useEffect, useRef } from 'react'
import { Search, X, User, FileText, Calendar, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { it, enUS } from 'date-fns/locale'
import { useLanguage } from '@/components/providers/language-provider'

interface SearchResult {
  users: Array<{
    id: string
    name: string | null
    username: string | null
    image: string | null
    bio: string | null
    role: string
    followers: number
    following: number
  }>
  posts: Array<{
    id: string
    content: string
    images: string[]
    tags: string[]
    author: {
      id: string
      name: string | null
      username: string | null
      image: string | null
    }
    likes: number
    comments: number
    createdAt: Date
  }>
  events: Array<{
    id: string
    title: string
    description: string
    type: string
    city: string
    startDate: Date
    imageUrl: string | null
    recruiter: {
      id: string
      name: string | null
      username: string | null
      image: string | null
    }
    participantsCount: number
    status: string
  }>
}

export function SearchBar() {
  const { t, language } = useLanguage()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (query.length < 2) {
      setResults(null)
      return
    }

    const timeoutId = setTimeout(() => {
      search(query)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  const search = async (searchQuery: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data)
        setIsOpen(true)
      }
    } catch (error) {
      console.error('Error searching:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResultClick = () => {
    setIsOpen(false)
    setQuery('')
  }

  const totalResults = results
    ? results.users.length + results.posts.length + results.events.length
    : 0

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder={t('placeholder.search') || 'Cerca utenti, post, eventi...'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results) setIsOpen(true)
          }}
          className="w-full pl-10 pr-10 h-10 bg-gray-100/80 dark:bg-gray-800/80 border-0 focus:ring-2 focus:ring-sky-500/30 rounded-full text-sm placeholder:text-gray-400 transition-all duration-200"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setResults(null)
              setIsOpen(false)
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && query.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 w-full z-50"
          >
            <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-2 border-sky-200 dark:border-sky-800 shadow-2xl max-h-96 overflow-y-auto">
              <CardContent className="p-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8 gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-sky-500" />
                    <span className="text-slate-500 dark:text-slate-400">{t('search.loading')}</span>
                  </div>
                ) : totalResults === 0 ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    {t('search.noResults')}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Users */}
                    {results?.users && results.users.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                          <User className="h-4 w-4" />
                          {t('search.users')} ({results.users.length})
                        </div>
                        <div className="space-y-2">
                          {results.users.map((user) => (
                            <Link
                              key={user.id}
                              href={`/dashboard/profile?userId=${user.id}`}
                              onClick={handleResultClick}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors"
                            >
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={user.image || undefined} />
                                <AvatarFallback className="bg-gradient-to-br from-sky-500 to-blue-600 text-white text-sm">
                                  {user.name?.charAt(0).toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                                  {user.name || user.username || t('search.user')}
                                </div>
                                {user.bio && (
                                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                    {user.bio}
                                  </div>
                                )}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Posts */}
                    {results?.posts && results.posts.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                          <FileText className="h-4 w-4" />
                          {t('search.posts')} ({results.posts.length})
                        </div>
                        <div className="space-y-2">
                          {results.posts.map((post) => (
                            <Link
                              key={post.id}
                              href={`/dashboard#post-${post.id}`}
                              onClick={handleResultClick}
                              className="block p-2 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={post.author.image || undefined} />
                                  <AvatarFallback className="bg-gradient-to-br from-sky-500 to-blue-600 text-white text-xs">
                                    {post.author.name?.charAt(0).toUpperCase() || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                  {post.author.name || post.author.username || t('search.user')}
                                </span>
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                {post.content}
                              </p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                                <span>{post.likes} {t('search.like')}</span>
                                <span>{post.comments} {t('search.comments')}</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Events */}
                    {results?.events && results.events.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                          <Calendar className="h-4 w-4" />
                          {t('search.events')} ({results.events.length})
                        </div>
                        <div className="space-y-2">
                          {results.events.map((event) => (
                            <Link
                              key={event.id}
                              href={`/dashboard/events/${event.id}`}
                              onClick={handleResultClick}
                              className="block p-2 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors"
                            >
                              <div className="font-semibold text-slate-800 dark:text-slate-100 mb-1">
                                {event.title}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {event.city} • {event.participantsCount} {t('events.participants')} •{' '}
                                {formatDistanceToNow(new Date(event.startDate), {
                                  addSuffix: true,
                                  locale: language === 'it' ? it : enUS,
                                })}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

