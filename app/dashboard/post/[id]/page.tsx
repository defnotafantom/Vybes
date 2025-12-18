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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Post non trovato</h1>
        <p className="text-gray-500">Il post potrebbe essere stato eliminato o non esiste.</p>
        <Link
          href="/dashboard"
          className="px-4 py-2 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors"
        >
          Torna alla Home
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Post</h1>
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
    </div>
  )
}
