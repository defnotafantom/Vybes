"use client"

import { useEffect, useState, useMemo, useCallback } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSession } from 'next-auth/react'
import { Heart, MessageCircle, Share2, MoreVertical, Bookmark, Send, Plus } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { it } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ViewModeSelector } from '@/components/feed/view-mode-selector'
import { TagFilters } from '@/components/feed/tag-filters'
import { NewPostPopup } from '@/components/feed/new-post-popup'
import { FeedCover, FeedSocial, FeedMasonry, FeedThreads } from '@/components/feed/feed-views'
import { CollaborationPost } from '@/components/posts/collaboration-post'
import { SearchBar } from '@/components/search/search-bar'
import { useLanguage } from '@/components/providers/language-provider'

interface Post {
  id: string
  content: string
  images: string[]
  author: {
    id: string
    name: string | null
    image: string | null
    username: string | null
  }
  createdAt: Date
  likes: number
  comments: number
  liked: boolean
  saved: boolean
  type?: string
}

interface Comment {
  id: string
  content: string
  createdAt: Date
  author: {
    id: string
    name: string | null
    username: string | null
    image: string | null
  }
}

const artTags = [
  { id: 1, name: "Arte" },
  { id: 2, name: "Illustrazione" },
  { id: 3, name: "Fotografia" },
  { id: 4, name: "Musica" },
  { id: 5, name: "Design" },
  { id: 6, name: "Animazione" },
]

const feedWidth = {
  cover: "max-w-6xl",
  social: "max-w-3xl",
  masonry: "max-w-7xl",
  threads: "max-w-2xl",
}

export default function DashboardFeed() {
  const { data: session } = useSession()
  const { t } = useLanguage()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [newPost, setNewPost] = useState('')
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [newComment, setNewComment] = useState<Record<string, string>>({})
  const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set())
  
  // New view mode state
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('homeViewMode') || 'social'
    }
    return 'social'
  })
  const [selectedTags, setSelectedTags] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('homeSelectedTags')
      return saved ? JSON.parse(saved) : []
    }
    return []
  })
  const [showNewPostPopup, setShowNewPostPopup] = useState(false)
  const [showCollaborationPopup, setShowCollaborationPopup] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchPosts = useCallback(async (page: number = 1) => {
    try {
      const response = await fetch(`/api/posts?page=${page}&limit=20`)
      if (response.ok) {
        const data = await response.json()
        if (page === 1) {
          setPosts(data.posts || [])
        } else {
          setPosts((prev) => [...prev, ...(data.posts || [])])
        }
        setHasMore(data.pagination?.hasMore || false)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts(1)
  }, [fetchPosts])

  // Persist view mode and tags
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('homeViewMode', viewMode)
    }
  }, [viewMode])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('homeSelectedTags', JSON.stringify(selectedTags))
    }
  }, [selectedTags])

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPost.trim()) return

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newPost }),
      })

      if (response.ok) {
        setNewPost('')
        fetchPosts(1)
      }
    } catch (error) {
      console.error('Error creating post:', error)
    }
  }

  const handleCreatePostWithDetails = async (data: { title: string; description: string; tags: string[]; fileUrl?: string | null }) => {
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: `${data.title}\n\n${data.description}`,
          images: data.fileUrl ? [data.fileUrl] : [],
          tags: data.tags || [],
        }),
      })

      if (response.ok) {
        fetchPosts(1)
        setCurrentPage(1)
      }
    } catch (error) {
      console.error('Error creating post:', error)
      throw error
    }
  }

  const handleCreateCollaboration = async (data: { content: string; type: string; collaborationArtists: string[] }) => {
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: data.content,
          type: data.type,
          collaborationArtists: data.collaborationArtists,
        }),
      })

      if (response.ok) {
        fetchPosts(1)
        setCurrentPage(1)
        // Update quest progress for collaboration
        if (session?.user?.id) {
          const { updateQuestProgress } = await import('@/lib/quests')
          await updateQuestProgress(session.user.id, 'collaboration', true)
        }
      }
    } catch (error) {
      console.error('Error creating collaboration:', error)
      throw error
    }
  }

  const handleLike = async (postId: string) => {
    // Optimistic update: avoid refetching the entire feed
    setPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p
        const nextLiked = !p.liked
        return { ...p, liked: nextLiked, likes: Math.max(0, p.likes + (nextLiked ? 1 : -1)) }
      })
    )
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
      })

      if (!response.ok) {
        // Rollback by refetching this page (safe fallback)
        fetchPosts(1)
      }
    } catch (error) {
      console.error('Error liking post:', error)
      fetchPosts(1)
    }
  }

  const handleSave = async (postId: string) => {
    // Optimistic update
    setPosts(prev => prev.map(p => (p.id === postId ? { ...p, saved: !p.saved } : p)))
    try {
      const response = await fetch(`/api/posts/${postId}/save`, {
        method: 'POST',
      })

      if (!response.ok) {
        fetchPosts(1)
      }
    } catch (error) {
      console.error('Error saving post:', error)
      fetchPosts(1)
    }
  }

  const toggleComments = async (postId: string) => {
    if (expandedComments.has(postId)) {
      setExpandedComments(prev => {
        const newSet = new Set(prev)
        newSet.delete(postId)
        return newSet
      })
    } else {
      setExpandedComments(prev => new Set(prev).add(postId))
      if (!comments[postId]) {
        fetchComments(postId)
      }
    }
  }

  const fetchComments = async (postId: string) => {
    setLoadingComments(prev => new Set(prev).add(postId))
    try {
      const response = await fetch(`/api/posts/${postId}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(prev => ({ ...prev, [postId]: data }))
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoadingComments(prev => {
        const newSet = new Set(prev)
        newSet.delete(postId)
        return newSet
      })
    }
  }

  const handleAddComment = async (postId: string, e: React.FormEvent) => {
    e.preventDefault()
    const content = newComment[postId]
    if (!content || !content.trim()) return

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      if (response.ok) {
        setNewComment(prev => ({ ...prev, [postId]: '' }))
        fetchComments(postId)
        // Update only the comment count locally instead of refetching the whole feed
        setPosts(prev => prev.map(p => (p.id === postId ? { ...p, comments: p.comments + 1 } : p)))
      }
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const toggleTag = (tagName: string) => {
    setSelectedTags(prev =>
      prev.includes(tagName) ? prev.filter(t => t !== tagName) : [...prev, tagName]
    )
  }

  const clearAllTags = () => setSelectedTags([])

  const filteredPosts = useMemo(() => {
    if (!selectedTags.length) return posts
    return posts.filter(p => {
      const postTags = (p as any).tags || []
      return selectedTags.some(tag => 
        postTags.includes(tag) || p.content?.toLowerCase().includes(tag.toLowerCase())
      )
    })
  }, [posts, selectedTags])

  const handleViewChange = (mode: string) => {
    if (mode === viewMode) return
    setTransitioning(true)
    setTimeout(() => {
      setViewMode(mode)
      setTransitioning(false)
    }, 200)
  }

  const renderPosts = () => {
    const commonProps = {
      posts: filteredPosts.map(post => ({
        ...post,
        title: post.content.split('\n')[0],
        description: post.content.split('\n').slice(1).join('\n'),
        imageUrl: post.images?.[0],
        author_name: post.author.name || post.author.username,
        isLiked: post.liked,
        isSaved: post.saved,
      })),
      onTagClick: toggleTag,
      onLike: handleLike,
      onSave: handleSave,
      onShare: (postId: string) => {
        if (typeof window !== 'undefined') {
          navigator.clipboard.writeText(`${window.location.origin}/dashboard#post-${postId}`)
        }
      },
      onReport: () => {},
      onCopyLink: (postId: string) => {
        if (typeof window !== 'undefined') {
          navigator.clipboard.writeText(`${window.location.origin}/dashboard#post-${postId}`)
        }
      },
    }

    switch (viewMode) {
      case "cover":
        return <FeedCover {...commonProps} />
      case "social":
        return <FeedSocial {...commonProps} />
      case "masonry":
        return <FeedMasonry {...commonProps} />
      case "threads":
        return <FeedThreads {...commonProps} />
      default:
        return <FeedSocial {...commonProps} />
    }
  }

  if (loading) {
    return <div className="text-center py-12">Caricamento feed...</div>
  }

  return (
    <div className="w-full">
      <div className={cn(
        "mx-auto transition-all duration-300",
        feedWidth[viewMode as keyof typeof feedWidth] || feedWidth.social
      )}>
        <div className={cn(
          "bg-gradient-to-br from-white/90 via-sky-50/30 to-blue-50/30 dark:from-gray-800/90 dark:via-sky-900/20 dark:to-blue-900/20 backdrop-blur-xl rounded-3xl shadow-2xl shadow-sky-500/10 dark:shadow-sky-900/20 p-4 md:p-6 flex flex-col gap-4 md:gap-6 border-2 border-sky-200/60 dark:border-sky-800/60 relative w-full",
          "transition-all duration-300 hover:shadow-3xl hover:shadow-sky-500/15 dark:hover:shadow-sky-900/30"
        )}>
        {/* Top controls */}
        <div className="flex flex-col gap-3 md:gap-4">
          {/* Search Bar */}
          <div className="w-full">
            <SearchBar />
          </div>
          
          {/* New Post Button */}
          <button
            onClick={() => setShowNewPostPopup(true)}
            className="flex items-center gap-3 w-full p-4 rounded-2xl shadow-lg bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 dark:from-sky-900/30 dark:via-blue-900/30 dark:to-indigo-900/30 hover:from-sky-100 hover:via-blue-100 hover:to-indigo-100 dark:hover:from-sky-900/50 dark:hover:via-blue-900/50 dark:hover:to-indigo-900/50 transition-all border-2 border-sky-200/60 dark:border-sky-800/60 hover:border-sky-300 dark:hover:border-sky-700 hover:shadow-xl group"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 rounded-full flex justify-center items-center text-white shadow-lg shadow-sky-500/30 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-sky-500/50 transition-all duration-300">
              <Plus className="h-5 w-5" />
            </div>
            <span className="text-gray-700 dark:text-gray-300 font-bold text-left flex-1">
              Crea nuovo post
            </span>
          </button>

          {/* View Mode Selector */}
          <ViewModeSelector viewMode={viewMode} setViewMode={handleViewChange} />

          {/* Tag Filters */}
          <TagFilters
            artTags={artTags}
            selectedTags={selectedTags}
            toggleTag={toggleTag}
            clearAll={clearAllTags}
          />
        </div>

        {/* FEED – transizione fluida */}
        <div className={cn(
          "transition-all duration-300",
          transitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
        )}>
          {filteredPosts.length === 0 ? (
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-sky-100 dark:border-sky-900 shadow-lg">
              <CardContent className="py-12 text-center text-slate-500 dark:text-slate-400">
                Nessun post ancora. Sii il primo a condividere qualcosa! ✨
              </CardContent>
            </Card>
          ) : (
            renderPosts()
          )}
        </div>

        {/* Legacy Social Feed (detailed view with comments) - shown only in social mode */}
        {viewMode === 'social' && (
          <div className="space-y-4 mt-6">
            {posts.map((post) => (
              <Card
                key={post.id}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-sky-100 dark:border-sky-900 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01]"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="ring-2 ring-sky-200 dark:ring-sky-800">
                        <AvatarImage src={post.author.image || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-sky-500 to-blue-600 text-white font-semibold">
                          {post.author.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-100">
                          {post.author.name || post.author.username || 'Utente'}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {formatDistanceToNow(new Date(post.createdAt), {
                            addSuffix: true,
                            locale: it,
                          })}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="hover:bg-sky-50 dark:hover:bg-sky-900/20">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">{post.content}</p>

                  {post.images.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl overflow-hidden">
                      {post.images.map((image, idx) => (
                        /\.(mp4|webm)(\?|$)/i.test(image) ? (
                          <video
                            key={idx}
                            src={image}
                            controls
                            className="rounded-xl w-full h-auto object-cover"
                          />
                        ) : (
                          <Image
                            key={idx}
                            src={image}
                            alt={`Post media ${idx + 1}`}
                            width={500}
                            height={500}
                            className="rounded-xl w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
                          />
                        )
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 md:gap-6 pt-4 border-t border-sky-200 dark:border-sky-800">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-2 transition-all duration-200 hover:scale-110 ${
                        post.liked
                          ? 'text-red-500 dark:text-red-400'
                          : 'text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400'
                      }`}
                    >
                      <Heart className={`h-5 w-5 transition-all ${post.liked ? 'fill-current scale-110' : ''}`} />
                      <span className="font-medium">{post.likes}</span>
                    </button>
                    <button
                      onClick={() => toggleComments(post.id)}
                      className={`flex items-center gap-2 transition-all duration-200 hover:scale-110 ${
                        expandedComments.has(post.id)
                          ? 'text-sky-600 dark:text-sky-400'
                          : 'text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400'
                      }`}
                    >
                      <MessageCircle className={`h-5 w-5 ${expandedComments.has(post.id) ? 'fill-current' : ''}`} />
                      <span className="font-medium">{post.comments}</span>
                    </button>
                    <button className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-all duration-200 hover:scale-110">
                      <Share2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleSave(post.id)}
                      className={`ml-auto flex items-center gap-2 transition-all duration-200 hover:scale-110 ${
                        post.saved
                          ? 'text-sky-600 dark:text-sky-400'
                          : 'text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400'
                      }`}
                    >
                      <Bookmark className={`h-5 w-5 ${post.saved ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Comments Section */}
                  {expandedComments.has(post.id) && (
                    <div className="mt-4 pt-4 border-t border-sky-200 dark:border-sky-800 space-y-4">
                      {loadingComments.has(post.id) ? (
                        <div className="text-center py-4 text-slate-500 dark:text-slate-400">{t('common.loading')}</div>
                      ) : (
                        <>
                          {comments[post.id]?.map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={comment.author.image || undefined} />
                                <AvatarFallback className="bg-gradient-to-br from-sky-500 to-blue-600 text-white text-xs">
                                  {comment.author.name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 bg-sky-50/50 dark:bg-sky-900/20 rounded-xl p-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                                    {comment.author.name || comment.author.username || 'Utente'}
                                  </span>
                                  <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: it })}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-700 dark:text-slate-300">{comment.content}</p>
                              </div>
                            </div>
                          ))}
                          {(!comments[post.id] || comments[post.id].length === 0) && (
                            <div className="text-center py-4 text-slate-500 dark:text-slate-400 text-sm">
                              {t('feed.comments.empty')}
                            </div>
                          )}
                          <form onSubmit={(e) => handleAddComment(post.id, e)} className="flex gap-2">
                            <Input
                              value={newComment[post.id] || ''}
                              onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                              placeholder={t('placeholder.comment')}
                              className="flex-1"
                            />
                            <Button
                              type="submit"
                              size="icon"
                              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </form>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </div>
      </div>

      {/* New Post Popup */}
      <NewPostPopup
        isOpen={showNewPostPopup}
        onClose={() => setShowNewPostPopup(false)}
        artTags={artTags}
        onPostSubmit={handleCreatePostWithDetails}
      />

      {/* Collaboration Popup */}
      {showCollaborationPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <CollaborationPost
              onPostCreate={handleCreateCollaboration}
              onClose={() => setShowCollaborationPopup(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
