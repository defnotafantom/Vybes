"use client"

import React from "react"
import Image from "next/image"
import { Heart, Bookmark, Share2, MoreVertical } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PostTags } from "./tag-filters"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { RoleBadge } from "@/components/ui/role-badge"

interface Post {
  id: string
  title?: string
  content?: string
  description?: string
  author?: {
    id?: string
    name?: string | null
    username?: string | null
    image?: string | null
    role?: string | null
  }
  author_name?: string
  imageUrl?: string
  image_url?: string
  media_url?: string
  media_type?: string
  images?: string[]
  tags?: string[]
  art_tag?: string
  type?: string
  likes?: number
  comments?: number
  isLiked?: boolean
  isSaved?: boolean
  createdAt?: Date | string
}

interface PostCardProps {
  post: Post
  mode?: "cover" | "social" | "masonry" | "threads"
  onTagClick?: (tag: string) => void
  onLike?: (postId: string) => void
  onSave?: (postId: string) => void
  onShare?: (postId: string) => void
  onReport?: (postId: string) => void
  onCopyLink?: (postId: string) => void
}

export function PostCard({
  post,
  mode = "cover",
  onTagClick,
  onLike,
  onSave,
  onShare,
  onReport,
  onCopyLink,
}: PostCardProps) {
  const imageUrl = post.imageUrl || post.image_url || post.media_url || (post.images && post.images[0])
  const mediaType = post.media_type || post.type
  const isVideo = typeof imageUrl === 'string' && /\.(mp4|webm)(\?|$)/i.test(imageUrl)
  const authorName = post.author?.name || post.author?.username || post.author_name || "Utente"
  const authorImage = post.author?.image
  const authorRole = post.author?.role
  const tags = post.tags || (post.art_tag ? post.art_tag.split(", ") : [])

  if (mode === "cover") {
    return (
      <article className="flex flex-col rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-sky-100 dark:border-sky-900 overflow-hidden group">
        {imageUrl && (
          <div className="relative w-full aspect-[4/3] overflow-hidden">
            {isVideo ? (
              <video src={imageUrl} controls className="w-full h-full object-cover" />
            ) : (
              <Image
                src={imageUrl}
                alt={post.title || post.content || "Post"}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
            )}
          </div>
        )}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            {post.title && (
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-2">{post.title}</h3>
            )}
            <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3">
              {post.description || post.content}
            </p>
            <PostTags tags={tags} onTagClick={onTagClick} />
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-sky-200 dark:border-sky-800">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={authorImage || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-sky-500 to-blue-600 text-white text-xs">
                  {authorName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2 min-w-0">
                <Link href={post.author?.id ? `/dashboard/users/${post.author.id}` : '#'} className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:underline truncate">
                  {authorName}
                </Link>
                <RoleBadge role={authorRole} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onLike?.(post.id)}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  post.isLiked
                    ? "text-red-500 dark:text-red-400"
                    : "text-slate-500 dark:text-slate-400 hover:text-red-500"
                )}
              >
                <Heart className={cn("h-5 w-5", post.isLiked && "fill-current")} />
              </button>
              <span className="text-sm text-slate-600 dark:text-slate-400">{post.likes || 0}</span>
            </div>
          </div>
        </div>
      </article>
    )
  }

  if (mode === "social") {
    return (
      <article className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-sky-100 dark:border-sky-900 p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={authorImage || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-sky-500 to-blue-600 text-white">
              {authorName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Link href={post.author?.id ? `/dashboard/users/${post.author.id}` : '#'} className="font-semibold text-slate-800 dark:text-slate-100 hover:underline">
                {authorName}
              </Link>
              <RoleBadge role={authorRole} />
            </div>
            {post.title && (
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">{post.title}</div>
            )}
          </div>
          <button className="p-2 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/20">
            <MoreVertical className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
        {imageUrl && (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden">
            {isVideo ? (
              <video src={imageUrl} controls className="w-full h-full object-cover" />
            ) : (
              <Image src={imageUrl} alt={post.title || ""} fill className="object-cover" />
            )}
          </div>
        )}
        <p className="text-slate-700 dark:text-slate-300">{post.description || post.content}</p>
        <PostTags tags={tags} onTagClick={onTagClick} />
        <div className="flex items-center gap-4 pt-2 border-t border-sky-200 dark:border-sky-800">
          <button
            onClick={() => onLike?.(post.id)}
            className={cn(
              "flex items-center gap-2 transition-all",
              post.isLiked ? "text-red-500 dark:text-red-400" : "text-slate-500 dark:text-slate-400"
            )}
          >
            <Heart className={cn("h-5 w-5", post.isLiked && "fill-current")} />
            <span>{post.likes || 0}</span>
          </button>
          <button
            onClick={() => onSave?.(post.id)}
            className={cn(
              "flex items-center gap-2 transition-all",
              post.isSaved ? "text-sky-600 dark:text-sky-400" : "text-slate-500 dark:text-slate-400"
            )}
          >
            <Bookmark className={cn("h-5 w-5", post.isSaved && "fill-current")} />
          </button>
          <button onClick={() => onShare?.(post.id)} className="text-slate-500 dark:text-slate-400">
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </article>
    )
  }

  if (mode === "masonry") {
    return (
      <article className="break-inside-avoid mb-4 rounded-2xl overflow-hidden shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-sky-100 dark:border-sky-900 group">
        {imageUrl && (
          <div className="relative w-full aspect-square overflow-hidden">
            {isVideo ? (
              <video src={imageUrl} controls className="w-full h-full object-cover" />
            ) : (
              <Image
                src={imageUrl}
                alt={post.title || ""}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
            )}
          </div>
        )}
        <div className="p-3">
          {post.title && (
            <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 mb-1">{post.title}</h3>
          )}
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{post.description || post.content}</p>
        </div>
      </article>
    )
  }

  // threads mode
  return (
    <article className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 mb-2 border border-sky-100 dark:border-sky-900">
      <p className="text-slate-700 dark:text-slate-300 text-sm">{post.description || post.content}</p>
      <PostTags tags={tags} onTagClick={onTagClick} />
      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
        <button onClick={() => onLike?.(post.id)} className="flex items-center gap-1">
          <Heart className={cn("h-4 w-4", post.isLiked && "fill-current text-red-500")} />
          {post.likes || 0}
        </button>
        <span>{post.comments || 0} commenti</span>
      </div>
    </article>
  )
}

