"use client"

import React from "react"
import { PostCard } from "./post-card"
import { cn } from "@/lib/utils"

interface Post {
  id: string
  [key: string]: any
}

interface FeedViewProps {
  posts: Post[]
  currentUserId?: string
  onTagClick?: (tag: string) => void
  onLike?: (postId: string) => void
  onSave?: (postId: string) => void
  onShare?: (postId: string) => void
  onReport?: (postId: string, reason: string) => void
  onEdit?: (postId: string) => void
  onDelete?: (postId: string) => void
  onCopyLink?: (postId: string) => void
}

export function FeedCover({ posts, ...props }: FeedViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-4">
      {posts.map((post, index) => (
        <div
          key={post.id}
          className="animate-in fade-in slide-in-from-bottom-4 duration-500"
          style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
        >
          <PostCard post={post} mode="cover" {...props} />
        </div>
      ))}
    </div>
  )
}

export function FeedSocial({ posts, ...props }: FeedViewProps) {
  return (
    <div className="flex flex-col gap-4 md:gap-5 mt-4">
      {posts.map((post, index) => (
        <div
          key={post.id}
          className="animate-in fade-in slide-in-from-bottom-4 duration-500"
          style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
        >
          <PostCard post={post} mode="social" {...props} />
        </div>
      ))}
    </div>
  )
}

export function FeedMasonry({ posts, ...props }: FeedViewProps) {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-5 mt-4">
      {posts.map((post, index) => (
        <div
          key={post.id}
          className="break-inside-avoid mb-4 md:mb-5 animate-in fade-in duration-500"
          style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
        >
          <PostCard post={post} mode="masonry" {...props} />
        </div>
      ))}
    </div>
  )
}

export function FeedThreads({ posts, ...props }: FeedViewProps) {
  // Group posts by author - improved
  const grouped = posts.reduce((acc: Record<string, { posts: Post[], authorId: string, authorImage?: string }>, post) => {
    const authorName = post.author?.name || post.author?.username || post.author_name || "Unknown"
    const authorId = post.author?.id || post.authorId || "unknown"
    const authorImage = post.author?.image || post.authorImage
    
    if (!acc[authorName]) {
      acc[authorName] = {
        posts: [],
        authorId,
        authorImage,
      }
    }
    acc[authorName].posts.push(post)
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-5 md:gap-6 mt-4">
      {Object.entries(grouped).map(([author, { posts: groupPosts, authorId, authorImage }], groupIndex) => (
        <div
          key={authorId}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 md:p-6 shadow-lg border border-sky-100/50 dark:border-sky-900/50 hover:border-sky-200 dark:hover:border-sky-800 transition-all duration-300"
          style={{ animationDelay: `${groupIndex * 100}ms` }}
        >
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-sky-200/50 dark:border-sky-800/50">
            {authorImage ? (
              <img
                src={authorImage}
                alt={author}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-sky-200 dark:ring-sky-800"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {author.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <span className="font-bold text-slate-800 dark:text-slate-100 block">{author}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{groupPosts.length} {groupPosts.length === 1 ? 'post' : 'post'}</span>
            </div>
          </div>
          <div className="space-y-4">
            {groupPosts.map((post) => (
              <PostCard key={post.id} post={post} mode="threads" {...props} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
