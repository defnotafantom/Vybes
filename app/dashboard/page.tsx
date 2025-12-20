"use client"

import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'
import { Plus, RefreshCw, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ViewModeSelector } from '@/components/feed/view-mode-selector'
import { TagFilters } from '@/components/feed/tag-filters'
import { NewPostPopup } from '@/components/feed/new-post-popup'
import { FeedCover, FeedSocial, FeedMasonry, FeedThreads } from '@/components/feed/feed-views'
import { EditPostModal } from '@/components/feed/edit-post-modal'
import { CollaborationPost } from '@/components/posts/collaboration-post'
import { SearchBar } from '@/components/search/search-bar'
import { useLanguage } from '@/components/providers/language-provider'
import { FeedSkeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { CommentsModal } from '@/components/feed/comments-modal'

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
  const { toast } = useToast()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  
  // View mode state
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
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [commentsPostId, setCommentsPostId] = useState<string | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const fetchPosts = useCallback(async (page: number = 1, showToast = false) => {
    try {
      setError(null)
      if (page > 1) setLoadingMore(true)
      
      const response = await fetch(`/api/posts?page=${page}&limit=20`)
      if (!response.ok) throw new Error("Errore nel caricamento")
      
        const data = await response.json()
        if (page === 1) {
          setPosts(data.posts || [])
        } else {
          setPosts((prev) => [...prev, ...(data.posts || [])])
        }
        setHasMore(data.pagination?.hasMore || false)
    } catch (err) {
      const msg = "Impossibile caricare i post"
      setError(msg)
      toast({ title: "Errore", description: msg, variant: "destructive" })
      console.error('Error fetching posts:', err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
      setRefreshing(false)
    }
  }, [toast])

  useEffect(() => {
    fetchPosts(1)
  }, [fetchPosts])

  // Infinite scroll with IntersectionObserver
  useEffect(() => {
    if (!hasMore || loadingMore || loading) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          const nextPage = currentPage + 1
          setCurrentPage(nextPage)
          fetchPosts(nextPage, true)
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    )
    if (loadMoreRef.current) observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, loading, currentPage, fetchPosts])

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

  // Manual refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    setCurrentPage(1)
    await fetchPosts(1, false)
    toast({ title: "Feed aggiornato", description: "I post sono stati aggiornati" })
  }, [fetchPosts, toast])

  const handleCreatePostWithDetails = async (data: { title: string; description: string; tags: string[]; fileUrl?: string | null; poll?: { question: string; options: string[] } }) => {
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: `${data.title}\n\n${data.description}`,
          images: data.fileUrl ? [data.fileUrl] : [],
          tags: data.tags || [],
          poll: data.poll,
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

  const handleDelete = useCallback((postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId))
  }, [])

  const handleEdit = useCallback((postId: string) => {
    const post = posts.find(p => p.id === postId)
    if (post) {
      setEditingPost(post)
    }
  }, [posts])

  const handleEditSave = useCallback((postId: string, data: { content: string; tags: string[] }) => {
    setPosts(prev => prev.map(p => 
      p.id === postId ? { ...p, content: data.content } : p
    ))
    setEditingPost(null)
  }, [])

  const handleCommentClick = useCallback((postId: string) => {
    setCommentsPostId(postId)
  }, [])

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
      currentUserId: session?.user?.id,
      onTagClick: toggleTag,
      onLike: handleLike,
      onSave: handleSave,
      onDelete: handleDelete,
      onEdit: handleEdit,
      onCommentClick: handleCommentClick,
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
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <FeedSkeleton count={3} />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className={cn(
        "mx-auto px-3 sm:px-4 lg:px-6 transition-all duration-300",
        feedWidth[viewMode as keyof typeof feedWidth] || feedWidth.social
      )}>
        {/* Create Post - Glass Card */}
        <div className="mt-4 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-gray-700/50 shadow-lg p-4">
          <button
            onClick={() => setShowNewPostPopup(true)}
            className="flex items-center gap-4 w-full group"
          >
            <div className="w-11 h-11 bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-sky-500/25 group-hover:shadow-sky-500/40 group-hover:scale-105 transition-all duration-300">
              <Plus className="h-5 w-5" />
            </div>
            <div className="flex-1 text-left py-3 px-5 bg-gray-100/80 dark:bg-gray-800/80 rounded-full text-sm text-gray-500 dark:text-gray-400 group-hover:bg-gray-200/80 dark:group-hover:bg-gray-700/80 transition-all duration-200 border border-transparent group-hover:border-sky-200/50 dark:group-hover:border-sky-800/50">
              {t('feed.newPost') || 'Condividi qualcosa con la community...'}
            </div>
          </button>
        </div>

        {/* Filters - Sticky Glass Bar */}
        <div className="sticky top-0 z-20 mt-4 -mx-3 sm:-mx-4 lg:-mx-6 px-3 sm:px-4 lg:px-6 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <SearchBar />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex-shrink-0 hover:bg-sky-100 dark:hover:bg-sky-900/30"
              title="Aggiorna feed"
            >
              <RefreshCw className={cn("h-5 w-5", refreshing && "animate-spin")} />
            </Button>
            <div className="flex-shrink-0">
              <ViewModeSelector viewMode={viewMode} setViewMode={handleViewChange} />
            </div>
          </div>
          
          {/* Tags - Horizontal scroll */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto scrollbar-hide -mx-3 px-3 pb-1">
            <TagFilters
              artTags={artTags}
              selectedTags={selectedTags}
              toggleTag={toggleTag}
              clearAll={clearAllTags}
            />
          </div>
        </div>

        {/* Feed Content */}
        <div className={cn(
          "mt-4 transition-all duration-200",
          transitioning ? "opacity-40 scale-[0.99]" : "opacity-100 scale-100"
        )}>
          {filteredPosts.length === 0 ? (
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-gray-700/50 shadow-lg p-12 sm:p-16 text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900/30 dark:to-blue-900/30 flex items-center justify-center">
                <Plus className="h-12 w-12 text-sky-500/60" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Nessun post ancora</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                Sii il primo a condividere qualcosa con la community!
              </p>
              <Button 
                onClick={() => setShowNewPostPopup(true)}
                className="rounded-full px-8 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-all duration-300"
              >
                Crea il primo post
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {renderPosts()}
            </div>
          )}
        </div>

        {/* Infinite Scroll Trigger / Loading More */}
        {filteredPosts.length > 0 && (
          <div ref={loadMoreRef} className="py-10 flex justify-center">
            {loadingMore ? (
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Caricamento altri post...</span>
              </div>
            ) : hasMore ? (
              <div className="text-sm text-gray-400 dark:text-gray-500">
                Scorri per caricare altri post
              </div>
            ) : (
              <div className="text-sm text-gray-400 dark:text-gray-500">
                Hai visto tutti i post disponibili
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <NewPostPopup
        isOpen={showNewPostPopup}
        onClose={() => setShowNewPostPopup(false)}
        artTags={artTags}
        onPostSubmit={handleCreatePostWithDetails}
      />

      {showCollaborationPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <CollaborationPost
            onPostCreate={handleCreateCollaboration}
            onClose={() => setShowCollaborationPopup(false)}
          />
        </div>
      )}

      {editingPost && (
        <EditPostModal
          isOpen={!!editingPost}
          onClose={() => setEditingPost(null)}
          post={editingPost}
          onSave={handleEditSave}
        />
      )}

      {/* Comments Modal - Centralized */}
      {commentsPostId && (
        <CommentsModal
          isOpen={!!commentsPostId}
          onClose={() => setCommentsPostId(null)}
          postId={commentsPostId}
          currentUserId={session?.user?.id}
          postAuthorId={posts.find(p => p.id === commentsPostId)?.author.id}
          onCommentCountChange={(count) => {
            setPosts(prev => prev.map(p => 
              p.id === commentsPostId ? { ...p, comments: count } : p
            ))
          }}
        />
      )}
    </div>
  )
}
