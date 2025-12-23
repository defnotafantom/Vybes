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
  const fetchingRef = useRef(false) // Prevent duplicate fetches
  const updatingPostsRef = useRef<Set<string>>(new Set()) // Track posts being updated

  const fetchPosts = useCallback(async (page: number = 1, showToast = false) => {
    // Prevent duplicate fetches
    if (fetchingRef.current && page > 1) return
    fetchingRef.current = true
    
    try {
      setError(null)
      const isLoadingMore = page > 1
      if (isLoadingMore) setLoadingMore(true)
      
      const response = await fetch(`/api/posts?page=${page}&limit=20`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Errore nel caricamento")
      }
      
      const data = await response.json()
      const newPosts = data.posts || []
      
      if (page === 1) {
        // Reset posts completely for first page
        setPosts((prev) => {
          // Use Set to ensure no duplicates even on refresh
          const existingIds = new Set(prev.map(p => p.id))
          const uniquePosts = newPosts.filter((p: Post) => !existingIds.has(p.id))
          if (uniquePosts.length === newPosts.length) return newPosts
          // Merge: keep old posts that aren't in new, then add new
          const newPostIds = new Set(newPosts.map((p: Post) => p.id))
          return [...prev.filter(p => !newPostIds.has(p.id)), ...newPosts]
        })
        if (showToast && newPosts.length > 0) {
          toast({ title: "Feed aggiornato", description: `${newPosts.length} post caricati` })
        }
      } else {
        // Prevent duplicates when loading more - improved
        setPosts((prev) => {
          const existingIds = new Set(prev.map(p => p.id))
          const uniqueNewPosts = newPosts.filter((p: Post) => !existingIds.has(p.id))
          if (uniqueNewPosts.length === 0) return prev // No new posts
          return [...prev, ...uniqueNewPosts]
        })
      }
      
      // Better pagination handling
      const totalPages = data.pagination?.totalPages || Math.ceil((data.pagination?.total || 0) / 20)
      setHasMore(page < totalPages && newPosts.length > 0)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Impossibile caricare i post"
      setError(msg)
      if (page === 1) {
        toast({ title: "Errore", description: msg, variant: "destructive" })
      }
      console.error('Error fetching posts:', err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
      setRefreshing(false)
      fetchingRef.current = false
    }
  }, [toast])

  useEffect(() => {
    fetchPosts(1)
  }, [fetchPosts])

  // Infinite scroll with IntersectionObserver - improved
  useEffect(() => {
    if (!hasMore || loadingMore || loading || !loadMoreRef.current) return
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          const nextPage = currentPage + 1
          setCurrentPage(nextPage)
          fetchPosts(nextPage, false)
        }
      },
      { threshold: 0.1, rootMargin: "300px" }
    )
    
    observer.observe(loadMoreRef.current)
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

  // Manual refresh handler - improved
  const handleRefresh = useCallback(async () => {
    if (refreshing) return
    setRefreshing(true)
    setCurrentPage(1)
    setHasMore(true)
    await fetchPosts(1, true)
  }, [fetchPosts, refreshing])

  const handleCreatePostWithDetails = useCallback(async (data: { title: string; description: string; tags: string[]; fileUrl?: string | null; poll?: { question: string; options: string[] } }) => {
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
        const newPost = await response.json().catch(() => null)
        // Add new post to the beginning of the list (optimistic add)
        if (newPost?.post) {
          setPosts(prev => {
            // Prevent duplicates
            const existingIds = new Set(prev.map(p => p.id))
            if (existingIds.has(newPost.post.id)) return prev
            return [newPost.post, ...prev]
          })
        } else {
          // Fallback: refresh first page
          setCurrentPage(1)
          await fetchPosts(1, false)
        }
        setCurrentPage(1)
        setHasMore(true) // Reset pagination
      }
    } catch (error) {
      console.error('Error creating post:', error)
      throw error
    }
  }, [fetchPosts])

  const handleCreateCollaboration = useCallback(async (data: { content: string; type: string; collaborationArtists: string[] }) => {
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
        const newPost = await response.json().catch(() => null)
        // Add new post to the beginning of the list (optimistic add)
        if (newPost?.post) {
          setPosts(prev => {
            // Prevent duplicates
            const existingIds = new Set(prev.map(p => p.id))
            if (existingIds.has(newPost.post.id)) return prev
            return [newPost.post, ...prev]
          })
        } else {
          // Fallback: refresh first page
          setCurrentPage(1)
          await fetchPosts(1, false)
        }
        setCurrentPage(1)
        setHasMore(true) // Reset pagination
        
        // Update quest progress for collaboration
        if (session?.user?.id) {
          const { updateQuestProgress } = await import('@/lib/quests')
          await updateQuestProgress(session.user.id, 'collaboration', true).catch(() => {})
        }
      }
    } catch (error) {
      console.error('Error creating collaboration:', error)
      throw error
    }
  }, [fetchPosts, session?.user?.id])

  const handleLike = useCallback(async (postId: string) => {
    // Prevent multiple simultaneous updates for the same post
    if (updatingPostsRef.current.has(postId)) return
    updatingPostsRef.current.add(postId)
    
    // Store previous state for rollback
    let previousPost: Post | null = null
    setPosts(prev => {
      const post = prev.find(p => p.id === postId)
      if (post) previousPost = { ...post }
      return prev.map(p => {
        if (p.id !== postId) return p
        const nextLiked = !p.liked
        return { ...p, liked: nextLiked, likes: Math.max(0, p.likes + (nextLiked ? 1 : -1)) }
      })
    })
    
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
      })

      if (!response.ok) {
        // Rollback to previous state
        if (previousPost) {
          setPosts(prev => prev.map(p => p.id === postId ? previousPost! : p))
        }
        toast({ title: "Errore", description: "Impossibile aggiungere il like", variant: "destructive" })
      }
    } catch (error) {
      console.error('Error liking post:', error)
      // Rollback to previous state
      if (previousPost) {
        setPosts(prev => prev.map(p => p.id === postId ? previousPost! : p))
      }
      toast({ title: "Errore", description: "Impossibile aggiungere il like", variant: "destructive" })
    } finally {
      updatingPostsRef.current.delete(postId)
    }
  }, [toast])

  const handleSave = useCallback(async (postId: string) => {
    // Prevent multiple simultaneous updates for the same post
    if (updatingPostsRef.current.has(postId)) return
    updatingPostsRef.current.add(postId)
    
    // Store previous state for rollback
    let previousPost: Post | null = null
    setPosts(prev => {
      const post = prev.find(p => p.id === postId)
      if (post) previousPost = { ...post }
      return prev.map(p => (p.id === postId ? { ...p, saved: !p.saved } : p))
    })
    
    try {
      const response = await fetch(`/api/posts/${postId}/save`, {
        method: 'POST',
      })

      if (!response.ok) {
        // Rollback to previous state
        if (previousPost) {
          setPosts(prev => prev.map(p => p.id === postId ? previousPost! : p))
        }
      }
    } catch (error) {
      console.error('Error saving post:', error)
      // Rollback to previous state
      if (previousPost) {
        setPosts(prev => prev.map(p => p.id === postId ? previousPost! : p))
      }
    } finally {
      updatingPostsRef.current.delete(postId)
    }
  }, [])

  const toggleTag = (tagName: string) => {
    setSelectedTags(prev =>
      prev.includes(tagName) ? prev.filter(t => t !== tagName) : [...prev, tagName]
    )
  }

  const clearAllTags = () => setSelectedTags([])

  // Improved tag filtering logic - with deduplication
  const filteredPosts = useMemo(() => {
    // First, ensure posts array has no duplicates
    const uniquePosts = Array.from(
      new Map(posts.map(p => [p.id, p])).values()
    )
    
    if (!selectedTags.length) return uniquePosts
    
    return uniquePosts.filter(p => {
      const postTags = (p as any).tags || []
      const contentLower = (p.content || '').toLowerCase()
      
      // Check if post matches any selected tag (OR logic)
      return selectedTags.some(tag => {
        const tagLower = tag.toLowerCase().trim()
        if (!tagLower) return false
        
        // Check in tags array (exact match or case-insensitive)
        if (postTags.some((pt: string) => pt.toLowerCase().trim() === tagLower)) return true
        // Check in content (word boundary for better matching)
        if (contentLower.includes(tagLower)) return true
        // Check exact tag match (e.g., #tag)
        if (contentLower.includes(`#${tagLower}`)) return true
        return false
      })
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
    // Remove post from state immediately (optimistic delete)
    setPosts(prev => {
      const filtered = prev.filter(p => p.id !== postId)
      // Also remove from updating set if present
      updatingPostsRef.current.delete(postId)
      return filtered
    })
  }, [])

  const handleEdit = useCallback((postId: string) => {
    const post = posts.find(p => p.id === postId)
    if (post) {
      setEditingPost(post)
    }
  }, [posts])

  const handleEditSave = useCallback((postId: string, data: { content: string; tags: string[] }) => {
    // Update post content and tags
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p
      const updated = { ...p, content: data.content }
      // Preserve existing tags structure if present
      if ((p as any).tags !== undefined) {
        (updated as any).tags = data.tags
      }
      return updated
    }))
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

        {/* Filters - Sticky Glass Bar - Improved Layout */}
        <div className="sticky top-0 z-20 mt-4 -mx-3 sm:-mx-4 lg:-mx-6 px-3 sm:px-4 lg:px-6 pt-3 pb-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-700/60 shadow-sm">
          <div className="flex flex-col gap-3">
            {/* Top row: Search, Refresh, View Mode */}
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <SearchBar />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                disabled={refreshing || loading}
                className="flex-shrink-0 hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-all duration-200"
                title="Aggiorna feed"
              >
                <RefreshCw className={cn("h-5 w-5 transition-transform duration-300", refreshing && "animate-spin")} />
              </Button>
              <div className="flex-shrink-0">
                <ViewModeSelector viewMode={viewMode} setViewMode={handleViewChange} />
              </div>
            </div>
            
            {/* Tags - Horizontal scroll with better styling */}
            {selectedTags.length > 0 && (
              <div className="flex items-center gap-2 px-1">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  Filtri attivi:
                </span>
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1">
                  {selectedTags.map(tag => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-full text-xs font-medium bg-sky-500/10 border border-sky-500/30 text-sky-600 dark:text-sky-400 whitespace-nowrap"
                    >
                      #{tag}
                    </span>
                  ))}
                  <button
                    onClick={clearAllTags}
                    className="px-2 py-1 rounded-full text-xs text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors whitespace-nowrap"
                  >
                    Rimuovi tutti
                  </button>
                </div>
              </div>
            )}
            
            {/* Tags - Horizontal scroll */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-3 px-3 pb-1">
              <TagFilters
                artTags={artTags}
                selectedTags={selectedTags}
                toggleTag={toggleTag}
                clearAll={clearAllTags}
              />
            </div>
          </div>
        </div>

        {/* Feed Content - Improved Layout */}
        <div className={cn(
          "mt-4 transition-all duration-300 ease-out",
          transitioning ? "opacity-50 scale-[0.98]" : "opacity-100 scale-100"
        )}>
          {error && !loading && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="flex-shrink-0"
              >
                Riprova
              </Button>
            </div>
          )}
          
          {filteredPosts.length === 0 && !loading ? (
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-gray-700/50 shadow-lg p-12 sm:p-16 text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900/30 dark:to-blue-900/30 flex items-center justify-center">
                <Plus className="h-12 w-12 text-sky-500/60" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {selectedTags.length > 0 ? "Nessun post trovato" : "Nessun post ancora"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                {selectedTags.length > 0 
                  ? "Prova a rimuovere alcuni filtri o a condividere qualcosa nuovo!"
                  : "Sii il primo a condividere qualcosa con la community!"}
              </p>
              {selectedTags.length > 0 ? (
                <Button 
                  onClick={clearAllTags}
                  variant="outline"
                  className="rounded-full px-6 py-2.5"
                >
                  Rimuovi filtri
                </Button>
              ) : (
                <Button 
                  onClick={() => setShowNewPostPopup(true)}
                  className="rounded-full px-8 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-all duration-300"
                >
                  Crea il primo post
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4 md:space-y-5">
              {renderPosts()}
            </div>
          )}
        </div>

        {/* Infinite Scroll Trigger / Loading More - Improved */}
        {filteredPosts.length > 0 && (
          <div ref={loadMoreRef} className="py-8 md:py-12 flex flex-col items-center justify-center gap-3">
            {loadingMore ? (
              <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                <Loader2 className="h-5 w-5 animate-spin text-sky-500" />
                <span className="text-sm font-medium">Caricamento altri post...</span>
              </div>
            ) : hasMore ? (
              <div className="flex flex-col items-center gap-2">
                <div className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                  Scorri per caricare altri post
                </div>
                <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-sky-300 to-transparent dark:via-sky-700"></div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="text-sm text-gray-400 dark:text-gray-500 font-medium">
                  Hai visto tutti i post disponibili
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'post'} nel feed
                </div>
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
