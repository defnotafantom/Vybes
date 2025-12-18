"use client"

import React, { memo, useState, useCallback } from "react"
import Image from "next/image"
import { Heart, Bookmark, Share2, MoreHorizontal, MessageCircle, Pencil, Trash2, Flag, Link2, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PostTags } from "./tag-filters"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { RoleBadge } from "@/components/ui/role-badge"
import { motion, AnimatePresence } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { it } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

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

// Action button component
const ActionButton = memo(function ActionButton({ 
  onClick, 
  isActive, 
  activeColor,
  icon: Icon,
  count,
  className
}: {
  onClick: () => void
  isActive?: boolean
  activeColor: string
  icon: React.ElementType
  count?: number
  className?: string
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 transition-colors",
        isActive ? activeColor : "text-gray-500 dark:text-gray-400 hover:" + activeColor,
        className
      )}
    >
      <Icon className={cn("h-5 w-5", isActive && "fill-current")} />
      {count !== undefined && <span className="text-sm font-medium">{count}</span>}
    </motion.button>
  )
})

// Post actions dropdown
function PostActionsDropdown({
  post,
  isOwner,
  onEdit,
  onDelete,
  onReport,
  onCopyLink,
  onClose,
}: {
  post: Post
  isOwner: boolean
  onEdit?: (postId: string) => void
  onDelete?: (postId: string) => void
  onReport?: (postId: string, reason: string) => void
  onCopyLink?: (postId: string) => void
  onClose: () => void
}) {
  const { toast } = useToast()
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState("")
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleCopyLink = () => {
    const url = `${window.location.origin}/dashboard#post-${post.id}`
    navigator.clipboard.writeText(url)
    toast({ title: "Link copiato!", description: "Il link è stato copiato negli appunti" })
    onCopyLink?.(post.id)
    onClose()
  }

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: "Post eliminato", description: "Il post è stato eliminato con successo" })
        onDelete?.(post.id)
      } else {
        throw new Error()
      }
    } catch {
      toast({ title: "Errore", description: "Impossibile eliminare il post", variant: "destructive" })
    }
    onClose()
  }

  const handleReport = async () => {
    if (!reportReason.trim()) {
      toast({ title: "Attenzione", description: "Inserisci un motivo per la segnalazione", variant: "destructive" })
      return
    }
    try {
      const res = await fetch(`/api/posts/${post.id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reportReason }),
      })
      if (res.ok) {
        toast({ title: "Segnalazione inviata", description: "Grazie per la segnalazione" })
        onReport?.(post.id, reportReason)
      } else {
        throw new Error()
      }
    } catch {
      toast({ title: "Errore", description: "Impossibile inviare la segnalazione", variant: "destructive" })
    }
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg z-50 overflow-hidden"
    >
      {/* Report Modal */}
      {showReportModal && (
        <div className="p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Segnala post</span>
            <button onClick={() => setShowReportModal(false)}>
              <X className="h-4 w-4" />
            </button>
          </div>
          <Input
            placeholder="Motivo della segnalazione"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            className="text-sm"
          />
          <Button onClick={handleReport} size="sm" className="w-full bg-red-500 hover:bg-red-600">
            Invia segnalazione
          </Button>
        </div>
      )}

      {/* Confirm Delete */}
      {confirmDelete && !showReportModal && (
        <div className="p-3 space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">Sei sicuro di voler eliminare questo post?</p>
          <div className="flex gap-2">
            <Button onClick={() => setConfirmDelete(false)} size="sm" variant="outline" className="flex-1">
              Annulla
            </Button>
            <Button onClick={handleDelete} size="sm" className="flex-1 bg-red-500 hover:bg-red-600">
              Elimina
            </Button>
          </div>
        </div>
      )}

      {/* Normal Menu */}
      {!showReportModal && !confirmDelete && (
        <>
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Link2 className="h-4 w-4" />
            Copia link
          </button>
          
          {isOwner ? (
            <>
              <button
                onClick={() => { onEdit?.(post.id); onClose(); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Pencil className="h-4 w-4" />
                Modifica
              </button>
              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4" />
                Elimina
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowReportModal(true)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Flag className="h-4 w-4" />
              Segnala
            </button>
          )}
        </>
      )}
    </motion.div>
  )
}

function PostCardComponent({
  post,
  mode = "cover",
  currentUserId,
  onTagClick,
  onLike,
  onSave,
  onShare,
  onReport,
  onEdit,
  onDelete,
  onCopyLink,
}: PostCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  
  const imageUrl = post.imageUrl || post.image_url || post.media_url || (post.images && post.images[0])
  const isVideo = typeof imageUrl === 'string' && /\.(mp4|webm)(\?|$)/i.test(imageUrl)
  const authorName = post.author?.name || post.author?.username || post.author_name || "Utente"
  const authorImage = post.author?.image
  const authorRole = post.author?.role
  const tags = post.tags || (post.art_tag ? post.art_tag.split(", ") : [])
  const timeAgo = post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: it }) : null
  const isOwner = currentUserId && post.author?.id === currentUserId
  
  const handleLike = useCallback(() => onLike?.(post.id), [onLike, post.id])
  const handleSave = useCallback(() => onSave?.(post.id), [onSave, post.id])
  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: post.title || 'Post su Vybes',
        url: `${window.location.origin}/dashboard#post-${post.id}`,
      })
    } else {
      onShare?.(post.id)
    }
  }, [onShare, post.id, post.title])

  // Close dropdown when clicking outside
  const handleClickOutside = useCallback(() => {
    setShowDropdown(false)
  }, [])

  if (mode === "social") {
    return (
      <motion.article 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-white/40 dark:border-gray-700/40 shadow-lg p-4 space-y-4"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href={post.author?.id ? `/dashboard/users/${post.author.id}` : '#'}>
            <Avatar className="h-11 w-11 ring-2 ring-white dark:ring-gray-800 hover:ring-sky-500 transition-all">
              <AvatarImage src={authorImage || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-sky-400 to-blue-500 text-white font-medium">
                {authorName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link 
                href={post.author?.id ? `/dashboard/users/${post.author.id}` : '#'} 
                className="font-semibold text-gray-900 dark:text-white hover:text-sky-500 transition-colors truncate"
              >
                {authorName}
              </Link>
              <RoleBadge role={authorRole} />
            </div>
            {timeAgo && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{timeAgo}</p>
            )}
          </div>
          
          {/* Actions dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <MoreHorizontal className="h-5 w-5 text-gray-500" />
            </button>
            <AnimatePresence>
              {showDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={handleClickOutside} />
                  <PostActionsDropdown
                    post={post}
                    isOwner={!!isOwner}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onReport={onReport}
                    onCopyLink={onCopyLink}
                    onClose={() => setShowDropdown(false)}
                  />
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Content */}
        <div>
          {post.title && (
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{post.title}</h3>
          )}
          <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{post.description || post.content}</p>
        </div>

        {/* Media */}
        {imageUrl && !imageError && (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
            {!imageLoaded && (
              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700" />
            )}
            {isVideo ? (
              <video src={imageUrl} controls className="w-full h-full object-cover" />
            ) : (
              <Image 
                src={imageUrl} 
                alt={post.title || ""} 
                fill 
                className={cn("object-cover transition-opacity", imageLoaded ? "opacity-100" : "opacity-0")}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                sizes="(max-width: 768px) 100vw, 600px"
              />
            )}
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && <PostTags tags={tags} onTagClick={onTagClick} />}

        {/* Actions */}
        <div className="flex items-center gap-6 pt-3 border-t border-gray-200 dark:border-gray-700">
          <ActionButton
            onClick={handleLike}
            isActive={post.isLiked}
            activeColor="text-red-500"
            icon={Heart}
            count={post.likes || 0}
          />
          <ActionButton
            onClick={() => {}}
            isActive={false}
            activeColor="text-sky-500"
            icon={MessageCircle}
            count={post.comments || 0}
          />
          <ActionButton
            onClick={handleShare}
            isActive={false}
            activeColor="text-sky-500"
            icon={Share2}
          />
          <ActionButton
            onClick={handleSave}
            isActive={post.isSaved}
            activeColor="text-sky-500"
            icon={Bookmark}
            className="ml-auto"
          />
        </div>
      </motion.article>
    )
  }

  if (mode === "cover") {
    return (
      <motion.article 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        className="flex flex-col rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/40 dark:border-gray-700/40 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group relative"
      >
        {/* Actions dropdown */}
        <div className="absolute top-2 right-2 z-10">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 rounded-xl bg-black/20 hover:bg-black/40 backdrop-blur-sm transition-colors"
          >
            <MoreHorizontal className="h-4 w-4 text-white" />
          </button>
          <AnimatePresence>
            {showDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={handleClickOutside} />
                <PostActionsDropdown
                  post={post}
                  isOwner={!!isOwner}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onReport={onReport}
                  onCopyLink={onCopyLink}
                  onClose={() => setShowDropdown(false)}
                />
              </>
            )}
          </AnimatePresence>
        </div>

        {imageUrl && !imageError && (
          <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
            {!imageLoaded && (
              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700" />
            )}
            {isVideo ? (
              <video src={imageUrl} controls className="w-full h-full object-cover" />
            ) : (
              <Image
                src={imageUrl}
                alt={post.title || post.content || "Post"}
                fill
                className={cn(
                  "object-cover transition-all duration-500",
                  imageLoaded ? "opacity-100 group-hover:scale-105" : "opacity-0"
                )}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            )}
          </div>
        )}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            {post.title && (
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{post.title}</h3>
            )}
            <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2">
              {post.description || post.content}
            </p>
            {tags.length > 0 && <PostTags tags={tags} onTagClick={onTagClick} />}
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <Link 
              href={post.author?.id ? `/dashboard/users/${post.author.id}` : '#'} 
              className="flex items-center gap-2 group/author"
            >
              <Avatar className="h-8 w-8 ring-2 ring-white dark:ring-gray-800">
                <AvatarImage src={authorImage || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-sky-400 to-blue-500 text-white text-xs font-medium">
                  {authorName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover/author:text-sky-500 transition-colors truncate">
                  {authorName}
                </span>
                <RoleBadge role={authorRole} />
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <ActionButton onClick={handleLike} isActive={post.isLiked} activeColor="text-red-500" icon={Heart} count={post.likes || 0} />
              <ActionButton onClick={handleSave} isActive={post.isSaved} activeColor="text-sky-500" icon={Bookmark} />
            </div>
          </div>
        </div>
      </motion.article>
    )
  }

  if (mode === "masonry") {
    return (
      <motion.article 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -4 }}
        className="break-inside-avoid mb-4 rounded-2xl overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/40 dark:border-gray-700/40 shadow-lg hover:shadow-xl transition-shadow group relative"
      >
        {/* Actions dropdown */}
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-1.5 rounded-lg bg-black/30 hover:bg-black/50 backdrop-blur-sm transition-colors"
          >
            <MoreHorizontal className="h-4 w-4 text-white" />
          </button>
          <AnimatePresence>
            {showDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={handleClickOutside} />
                <PostActionsDropdown
                  post={post}
                  isOwner={!!isOwner}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onReport={onReport}
                  onCopyLink={onCopyLink}
                  onClose={() => setShowDropdown(false)}
                />
              </>
            )}
          </AnimatePresence>
        </div>

        {imageUrl && !imageError && (
          <div className="relative w-full aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
            {!imageLoaded && (
              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700" />
            )}
            {isVideo ? (
              <video src={imageUrl} controls className="w-full h-full object-cover" />
            ) : (
              <Image
                src={imageUrl}
                alt={post.title || ""}
                fill
                className={cn(
                  "object-cover transition-all duration-300",
                  imageLoaded ? "opacity-100 group-hover:scale-105" : "opacity-0"
                )}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
              <div className="flex items-center gap-3 text-white w-full justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={handleLike} className="flex items-center gap-1">
                    <Heart className={cn("h-4 w-4", post.isLiked && "fill-current")} />
                    <span className="text-sm">{post.likes || 0}</span>
                  </button>
                  <span className="flex items-center gap-1 text-sm">
                    <MessageCircle className="h-4 w-4" />
                    {post.comments || 0}
                  </span>
                </div>
                <button onClick={handleSave}>
                  <Bookmark className={cn("h-4 w-4", post.isSaved && "fill-current")} />
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="p-3">
          {post.title && (
            <h3 className="font-medium text-sm text-gray-900 dark:text-white mb-1 line-clamp-1">{post.title}</h3>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{post.description || post.content}</p>
        </div>
      </motion.article>
    )
  }

  // threads mode
  return (
    <motion.article 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 mb-3 border border-white/40 dark:border-gray-700/40 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex gap-3">
        <Link href={post.author?.id ? `/dashboard/users/${post.author.id}` : '#'}>
          <Avatar className="h-9 w-9 ring-2 ring-white dark:ring-gray-800">
            <AvatarImage src={authorImage || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-sky-400 to-blue-500 text-white text-xs">
              {authorName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Link 
                href={post.author?.id ? `/dashboard/users/${post.author.id}` : '#'}
                className="font-medium text-sm text-gray-900 dark:text-white hover:text-sky-500 transition-colors"
              >
                {authorName}
              </Link>
              {timeAgo && <span className="text-xs text-gray-500">· {timeAgo}</span>}
            </div>
            {/* Actions dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <MoreHorizontal className="h-4 w-4 text-gray-500" />
              </button>
              <AnimatePresence>
                {showDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={handleClickOutside} />
                    <PostActionsDropdown
                      post={post}
                      isOwner={!!isOwner}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onReport={onReport}
                      onCopyLink={onCopyLink}
                      onClose={() => setShowDropdown(false)}
                    />
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
          <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">{post.description || post.content}</p>
          
          {/* Media */}
          {imageUrl && !imageError && (
            <div className="relative w-full mt-3 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
              {!imageLoaded && (
                <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 aspect-video" />
              )}
              {isVideo ? (
                <video src={imageUrl} controls className="w-full max-h-80 object-contain" />
              ) : (
                <Image
                  src={imageUrl}
                  alt={post.title || ""}
                  width={600}
                  height={400}
                  className={cn("w-full max-h-80 object-contain transition-opacity", imageLoaded ? "opacity-100" : "opacity-0")}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
              )}
            </div>
          )}
          
          {tags.length > 0 && <PostTags tags={tags} onTagClick={onTagClick} />}
          
          <div className="flex items-center gap-4 mt-3 text-gray-500">
            <button onClick={handleLike} className={cn("flex items-center gap-1 text-sm hover:text-red-500 transition-colors", post.isLiked && "text-red-500")}>
              <Heart className={cn("h-4 w-4", post.isLiked && "fill-current")} />
              {post.likes || 0}
            </button>
            <span className="flex items-center gap-1 text-sm">
              <MessageCircle className="h-4 w-4" />
              {post.comments || 0}
            </span>
            <button onClick={handleShare} className="flex items-center gap-1 text-sm hover:text-sky-500 transition-colors">
              <Share2 className="h-4 w-4" />
            </button>
            <button onClick={handleSave} className={cn("flex items-center gap-1 text-sm hover:text-sky-500 transition-colors ml-auto", post.isSaved && "text-sky-500")}>
              <Bookmark className={cn("h-4 w-4", post.isSaved && "fill-current")} />
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

export const PostCard = memo(PostCardComponent)
