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
  onTagClick?: (tag: string) => void
  onLike?: (postId: string) => void
  onSave?: (postId: string) => void
  onShare?: (postId: string) => void
  onReport?: (postId: string) => void
  onCopyLink?: (postId: string) => void
}

export function FeedCover({ posts, ...props }: FeedViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} mode="cover" {...props} />
      ))}
    </div>
  )
}

export function FeedSocial({ posts, ...props }: FeedViewProps) {
  return (
    <div className="flex flex-col gap-4 mt-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} mode="social" {...props} />
      ))}
    </div>
  )
}

export function FeedMasonry({ posts, ...props }: FeedViewProps) {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 mt-4">
      {posts.map((post) => (
        <div key={post.id} className="break-inside-avoid mb-4">
          <PostCard post={post} mode="masonry" {...props} />
        </div>
      ))}
    </div>
  )
}

export function FeedThreads({ posts, ...props }: FeedViewProps) {
  // Group posts by author
  const grouped = posts.reduce((acc: Record<string, Post[]>, post) => {
    const authorName = post.author?.name || post.author?.username || post.author_name || "Unknown"
    if (!acc[authorName]) acc[authorName] = []
    acc[authorName].push(post)
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-4 mt-4">
      {Object.entries(grouped).map(([author, group]) => (
        <div
          key={author}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-sky-100 dark:border-sky-900"
        >
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-sky-200 dark:border-sky-800">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold">
              {author.charAt(0).toUpperCase()}
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-100">{author}</span>
          </div>
          {group.map((post) => (
            <PostCard key={post.id} post={post} mode="threads" {...props} />
          ))}
        </div>
      ))}
    </div>
  )
}

