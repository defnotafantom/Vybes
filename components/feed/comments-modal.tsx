"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { X, Send, Smile, Reply, Trash2, Loader2, MessageCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import { it } from "date-fns/locale"
import { cn } from "@/lib/utils"
import Link from "next/link"

const EMOJI_LIST = ["😀", "😂", "😍", "🥰", "😎", "🤩", "👍", "👏", "🔥", "❤️", "💯", "🎉", "✨", "🙌", "💪", "🤔"]

interface Comment {
  id: string
  content: string
  createdAt: string
  likesCount: number
  parentId?: string | null
  author: {
    id: string
    name: string | null
    username: string | null
    image: string | null
  }
  replies?: Comment[]
}

interface CommentsModalProps {
  isOpen: boolean
  onClose: () => void
  postId: string
  postAuthorId?: string
  currentUserId?: string
  onCommentCountChange?: (count: number) => void
}

export function CommentsModal({
  isOpen,
  onClose,
  postId,
  postAuthorId,
  currentUserId,
  onCommentCountChange,
}: CommentsModalProps) {
  const { toast } = useToast()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [content, setContent] = useState("")
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null)
  const [showEmoji, setShowEmoji] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/posts/${postId}/comments`)
      if (res.ok) {
        const data = await res.json()
        const rootComments: Comment[] = []
        const commentMap = new Map<string, Comment>()
        
        data.forEach((c: Comment) => {
          c.replies = []
          commentMap.set(c.id, c)
        })
        
        data.forEach((c: Comment) => {
          if (c.parentId && commentMap.has(c.parentId)) {
            commentMap.get(c.parentId)!.replies!.push(c)
          } else {
            rootComments.push(c)
          }
        })
        
        setComments(rootComments)
        onCommentCountChange?.(data.length)
      }
    } catch (error) {
      console.error("Error fetching comments:", error)
    } finally {
      setLoading(false)
    }
  }, [postId, onCommentCountChange])

  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      fetchComments()
      // Lock body scroll
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, fetchComments])

  const handleSubmit = async () => {
    if (!content.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          parentId: replyingTo?.id || null,
        }),
      })

      if (res.ok) {
        setContent("")
        setReplyingTo(null)
        setShowEmoji(false)
        await fetchComments()
        // Scroll to bottom
        setTimeout(() => {
          listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
        }, 100)
        toast({ title: "Commento pubblicato" })
      } else {
        throw new Error()
      }
    } catch {
      toast({ title: "Errore", description: "Impossibile pubblicare il commento", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        fetchComments()
        toast({ title: "Commento eliminato" })
      }
    } catch {
      toast({ title: "Errore", variant: "destructive" })
    }
  }

  const handleReply = (comment: Comment) => {
    setReplyingTo(comment)
    inputRef.current?.focus()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-end md:items-center justify-center"
      >
        <motion.div
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-900 w-full md:max-w-md md:rounded-2xl rounded-t-[20px] max-h-[90vh] md:max-h-[80vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-sky-500" />
              <h2 className="font-semibold text-gray-900 dark:text-white">Commenti</h2>
              {!loading && <span className="text-xs text-gray-400">({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})</span>}
            </div>
            <button 
              onClick={onClose} 
              className="p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Comments List */}
          <div ref={listRef} className="flex-1 overflow-y-auto overscroll-contain">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-sky-500" />
                <span className="text-sm text-gray-400">Caricamento...</span>
              </div>
            ) : comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                  <MessageCircle className="h-7 w-7 text-gray-400" />
                </div>
                <p className="font-medium text-gray-900 dark:text-white mb-1">Nessun commento</p>
                <p className="text-sm text-gray-500">Sii il primo a dire la tua!</p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    currentUserId={currentUserId}
                    onReply={() => handleReply(comment)}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Input Area - Fixed at bottom */}
          <div className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 safe-area-bottom">
            {/* Reply indicator */}
            <AnimatePresence>
              {replyingTo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-2 px-3 py-2 bg-sky-50 dark:bg-sky-900/20 rounded-lg flex items-center justify-between"
                >
                  <span className="text-xs text-sky-600 dark:text-sky-400">
                    Rispondendo a <strong>{replyingTo.author.name || replyingTo.author.username}</strong>
                  </span>
                  <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-sky-100 dark:hover:bg-sky-800/30 rounded">
                    <X className="h-3 w-3 text-sky-500" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Emoji picker */}
            <AnimatePresence>
              {showEmoji && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-2 overflow-hidden"
                >
                  <div className="flex flex-wrap gap-1 p-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    {EMOJI_LIST.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setContent((prev) => prev + emoji)}
                        className="text-lg hover:scale-110 transition-transform p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEmoji(!showEmoji)}
                className={cn(
                  "p-2.5 rounded-full transition-colors flex-shrink-0",
                  showEmoji ? "bg-sky-100 dark:bg-sky-900/30 text-sky-500" : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
                )}
              >
                <Smile className="h-5 w-5" />
              </button>
              <input
                ref={inputRef}
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()}
                placeholder={replyingTo ? "Rispondi..." : "Scrivi un commento..."}
                className="flex-1 px-4 py-2.5 rounded-full bg-gray-100 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-sky-500/30 outline-none text-sm"
              />
              <Button
                onClick={handleSubmit}
                disabled={!content.trim() || submitting}
                size="icon"
                className="bg-sky-500 hover:bg-sky-600 rounded-full h-10 w-10 flex-shrink-0"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function CommentItem({
  comment,
  currentUserId,
  onReply,
  onDelete,
  depth = 0,
}: {
  comment: Comment
  currentUserId?: string
  onReply: () => void
  onDelete: (id: string) => void
  depth?: number
}) {
  const isOwner = currentUserId === comment.author.id
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: it })

  return (
    <div className={cn("group", depth > 0 && "ml-10 mt-3")}>
      <div className="flex gap-2.5">
        <Link href={`/dashboard/users/${comment.author.id}`} className="flex-shrink-0">
          <Avatar className={cn("ring-2 ring-white dark:ring-gray-900", depth > 0 ? "h-7 w-7" : "h-8 w-8")}>
            <AvatarImage src={comment.author.image || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-sky-400 to-blue-500 text-white text-xs">
              {(comment.author.name || comment.author.username || "U").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="inline-block bg-gray-100 dark:bg-gray-800 rounded-2xl px-3 py-2 max-w-full">
            <Link
              href={`/dashboard/users/${comment.author.id}`}
              className="font-semibold text-xs text-gray-900 dark:text-white hover:text-sky-500 transition-colors"
            >
              {comment.author.name || comment.author.username}
            </Link>
            <p className="text-sm text-gray-700 dark:text-gray-300 break-words">{comment.content}</p>
          </div>
          
          {/* Actions inline */}
          <div className="flex items-center gap-3 mt-1 ml-1 text-[11px] text-gray-400">
            <span>{timeAgo}</span>
            <button onClick={onReply} className="font-semibold hover:text-sky-500 transition-colors">
              Rispondi
            </button>
            {isOwner && (
              <button onClick={() => onDelete(comment.id)} className="font-semibold hover:text-red-500 transition-colors">
                Elimina
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              onReply={onReply}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

