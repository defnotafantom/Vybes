"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { PostCard } from "@/components/feed/post-card"
import { useSession } from "next-auth/react"
import Link from "next/link"

export default function SinglePostPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setPost(data)
          // Update document title dynamically
          if (data.content) {
            const title = data.content.split('\n')[0].slice(0, 60)
            document.title = `${title} · Vybes`
          }
        } else {
          setError(true)
        }
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchPost()
    }
  }, [params.id])

  const handleLike = async (postId: string) => {
    await fetch(`/api/posts/${postId}/like`, { method: 'POST' })
  }

  const handleSave = async (postId: string) => {
    await fetch(`/api/posts/${postId}/save`, { method: 'POST' })
  }

  const handleDelete = (postId: string) => {
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
          <p className="text-sm text-gray-500">Caricamento post...</p>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-2">
          <span className="text-4xl">🔍</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Post non trovato</h1>
        <p className="text-gray-500 text-center max-w-sm">Il post potrebbe essere stato eliminato o non esiste.</p>
        <Link
          href="/dashboard"
          className="px-6 py-2.5 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors font-medium"
        >
          Torna alla Home
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md py-3 -mx-4 px-4 z-10 border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Post</h1>
      </div>

      {/* Post */}
      <PostCard
        post={{
          id: post.id,
          content: post.content,
          images: post.images,
          tags: post.tags,
          author: post.author,
          createdAt: post.createdAt,
          likes: post._count?.likes || 0,
          comments: post._count?.comments || 0,
          reposts: post._count?.reposts || 0,
          isLiked: post.liked,
          isSaved: post.saved,
          isPinned: post.isPinned,
          hasPoll: !!post.poll,
          reactions: post.reactions || [],
          userReactions: post.userReactions || [],
        }}
        mode="social"
        currentUserId={session?.user?.id}
        onLike={handleLike}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  )
}


"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { PostCard } from "@/components/feed/post-card"
import { useSession } from "next-auth/react"
import Link from "next/link"

export default function SinglePostPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setPost(data)
          // Update document title dynamically
          if (data.content) {
            const title = data.content.split('\n')[0].slice(0, 60)
            document.title = `${title} · Vybes`
          }
        } else {
          setError(true)
        }
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchPost()
    }
  }, [params.id])

  const handleLike = async (postId: string) => {
    await fetch(`/api/posts/${postId}/like`, { method: 'POST' })
  }

  const handleSave = async (postId: string) => {
    await fetch(`/api/posts/${postId}/save`, { method: 'POST' })
  }

  const handleDelete = (postId: string) => {
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
          <p className="text-sm text-gray-500">Caricamento post...</p>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-2">
          <span className="text-4xl">🔍</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Post non trovato</h1>
        <p className="text-gray-500 text-center max-w-sm">Il post potrebbe essere stato eliminato o non esiste.</p>
        <Link
          href="/dashboard"
          className="px-6 py-2.5 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors font-medium"
        >
          Torna alla Home
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md py-3 -mx-4 px-4 z-10 border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Post</h1>
      </div>

      {/* Post */}
      <PostCard
        post={{
          id: post.id,
          content: post.content,
          images: post.images,
          tags: post.tags,
          author: post.author,
          createdAt: post.createdAt,
          likes: post._count?.likes || 0,
          comments: post._count?.comments || 0,
          reposts: post._count?.reposts || 0,
          isLiked: post.liked,
          isSaved: post.saved,
          isPinned: post.isPinned,
          hasPoll: !!post.poll,
          reactions: post.reactions || [],
          userReactions: post.userReactions || [],
        }}
        mode="social"
        currentUserId={session?.user?.id}
        onLike={handleLike}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  )
}




