"use client"

import { useEffect, useState, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'
import { Plus } from 'lucide-react'
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
import { TrendingSidebar } from '@/components/feed/trending-sidebar'
import { StoryBar } from '@/components/stories/story-bar'

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
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  
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
      <div className="max-w-2xl mx-auto px-4 py-4">
        <FeedSkeleton count={3} />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20 md:pb-4">
      {/* Main Container */}
      <div className={cn(
        "mx-auto px-0 sm:px-4 transition-all duration-200",
        feedWidth[viewMode as keyof typeof feedWidth] || feedWidth.social
      )}>
        <div className="flex gap-6">
          {/* Main Column */}
          <div className="flex-1 min-w-0">
            {/* Stories - full width on mobile */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sm:rounded-xl sm:border sm:mb-4 sm:border-gray-200/60 dark:sm:border-gray-700/60">
              <StoryBar currentUserId={session?.user?.id} />
            </div>

            {/* Create Post - compact */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sm:rounded-xl sm:border sm:mb-4 sm:border-gray-200/60 dark:sm:border-gray-700/60 p-3">
              <button
                onClick={() => setShowNewPostPopup(true)}
                className="flex items-center gap-3 w-full"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                  <Plus className="h-4 w-4" />
                </div>
                <div className="flex-1 text-left py-2 px-3 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-500 dark:text-gray-400">
                  {t('feed.newPost') || 'A cosa stai pensando?'}
                </div>
              </button>
            </div>

            {/* Filters Bar - sticky */}
            <div className="sticky top-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 sm:rounded-xl sm:border sm:mb-4 sm:border-gray-200/60 dark:sm:border-gray-700/60">
              <div className="p-3 space-y-2">
                {/* Search */}
                <SearchBar />
                
                {/* View Mode + Tags Row */}
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-3 px-3">
                  <ViewModeSelector viewMode={viewMode} setViewMode={handleViewChange} />
                  <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                  <TagFilters
                    artTags={artTags}
                    selectedTags={selectedTags}
                    toggleTag={toggleTag}
                    clearAll={clearAllTags}
                  />
                </div>
              </div>
            </div>

            {/* Feed */}
            <div className={cn(
              "transition-opacity duration-150",
              transitioning ? "opacity-60" : "opacity-100"
            )}>
              {filteredPosts.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 sm:rounded-xl sm:border sm:border-gray-200/60 dark:sm:border-gray-700/60 p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Plus className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white mb-1">Nessun post</p>
                  <p className="text-sm text-gray-500 mb-4">Sii il primo a condividere!</p>
                  <Button 
                    onClick={() => setShowNewPostPopup(true)}
                    size="sm"
                    className="rounded-full"
                  >
                    Crea post
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800 sm:space-y-4 sm:divide-y-0">
                  {renderPosts()}
                </div>
              )}
            </div>

            {/* Load More */}
            {hasMore && filteredPosts.length > 0 && (
              <div className="p-4 flex justify-center">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setCurrentPage(prev => prev + 1)
                    fetchPosts(currentPage + 1)
                  }}
                  className="text-sky-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                >
                  Carica altri
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar - Desktop */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-4">
              <TrendingSidebar onTagClick={toggleTag} />
            </div>
          </div>
        </div>
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
    </div>
  )
}
