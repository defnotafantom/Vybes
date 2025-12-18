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
      <div className="w-full">
        <div className="mx-auto max-w-3xl">
          <div className="bg-gradient-to-br from-white/90 via-sky-50/30 to-blue-50/30 dark:from-gray-800/90 dark:via-sky-900/20 dark:to-blue-900/20 backdrop-blur-xl rounded-3xl shadow-2xl p-4 md:p-6">
            <FeedSkeleton count={3} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className={cn(
        "mx-auto transition-all duration-300 flex gap-6",
        feedWidth[viewMode as keyof typeof feedWidth] || feedWidth.social
      )}>
        {/* Main Feed */}
        <div className="flex-1 min-w-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 dark:border-gray-700/40 p-4 md:p-6 flex flex-col gap-4 md:gap-5">
        {/* Top controls */}
        <div className="flex flex-col gap-3 md:gap-4">
          {/* Search Bar */}
          <div className="w-full">
            <SearchBar />
          </div>
          
          {/* New Post Button */}
          <button
            onClick={() => setShowNewPostPopup(true)}
            className="flex items-center gap-3 w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700 group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl flex justify-center items-center text-white shadow-md group-hover:shadow-lg transition-shadow">
              <Plus className="h-5 w-5" />
            </div>
            <span className="text-gray-600 dark:text-gray-300 font-medium text-left flex-1">
              {t('feed.newPost') || 'Crea nuovo post'}
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
            <div className="py-16 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-2">Nessun post ancora</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Sii il primo a condividere qualcosa!</p>
            </div>
          ) : (
            renderPosts()
          )}
        </div>

        {/* Load More */}
        {hasMore && filteredPosts.length > 0 && (
          <div className="flex justify-center pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setCurrentPage(prev => prev + 1)
                fetchPosts(currentPage + 1)
              }}
              className="rounded-xl"
            >
              Carica altri post
            </Button>
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

      {/* Edit Post Modal */}
      {editingPost && (
        <EditPostModal
          isOpen={!!editingPost}
          onClose={() => setEditingPost(null)}
          post={editingPost}
          onSave={handleEditSave}
        />
      )}

      {/* Trending Sidebar - Desktop only */}
      <div className="hidden lg:block w-80 flex-shrink-0 sticky top-4 h-fit">
        <TrendingSidebar onTagClick={toggleTag} />
      </div>
    </div>
  )
}
