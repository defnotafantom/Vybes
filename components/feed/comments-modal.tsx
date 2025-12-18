"use client"

import { useState, useEffect, useCallback } from "react"
import { X, Send, Smile, Heart, Reply, MoreHorizontal, Trash2, Loader2 } from "lucide-react"
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

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/posts/${postId}/comments`)
      if (res.ok) {
        const data = await res.json()
        // Organize into tree structure
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
      fetchComments()
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
        fetchComments()
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

  const addEmoji = (emoji: string) => {
    setContent((prev) => prev + emoji)
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl border border-white/50 dark:border-gray-700/50"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Commenti</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-sky-500" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nessun commento ancora</p>
              <p className="text-sm">Sii il primo a commentare!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={currentUserId}
                onReply={() => setReplyingTo(comment)}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>

        {/* Reply indicator */}
        {replyingTo && (
          <div className="px-4 py-2 bg-sky-50 dark:bg-sky-900/20 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <span className="text-sm text-sky-600 dark:text-sky-400">
              Rispondendo a <strong>{replyingTo.author.name || replyingTo.author.username}</strong>
            </span>
            <button onClick={() => setReplyingTo(null)} className="text-gray-500 hover:text-gray-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          {/* Emoji picker */}
          <AnimatePresence>
            {showEmoji && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3 overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-xl">
                  {EMOJI_LIST.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => addEmoji(emoji)}
                      className="text-xl hover:scale-125 transition-transform p-1"
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
                "p-2 rounded-xl transition-colors",
                showEmoji ? "bg-sky-100 dark:bg-sky-900/30 text-sky-600" : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
              )}
            >
              <Smile className="h-5 w-5" />
            </button>
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()}
              placeholder={replyingTo ? "Scrivi una risposta..." : "Scrivi un commento..."}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:border-sky-500 text-sm"
            />
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || submitting}
              size="icon"
              className="bg-sky-500 hover:bg-sky-600 rounded-xl h-10 w-10"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
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
  const [showActions, setShowActions] = useState(false)
  const isOwner = currentUserId === comment.author.id
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: it })

  return (
    <div className={cn("space-y-3", depth > 0 && "ml-8 pl-3 border-l-2 border-gray-200 dark:border-gray-700")}>
      <div className="flex gap-3">
        <Link href={`/dashboard/users/${comment.author.id}`}>
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={comment.author.image || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-sky-400 to-blue-500 text-white text-xs">
              {(comment.author.name || comment.author.username || "U").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-3 py-2">
            <div className="flex items-center gap-2">
              <Link
                href={`/dashboard/users/${comment.author.id}`}
                className="font-medium text-sm text-gray-900 dark:text-white hover:text-sky-500"
              >
                {comment.author.name || comment.author.username}
              </Link>
              <span className="text-xs text-gray-500">{timeAgo}</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5 whitespace-pre-wrap">{comment.content}</p>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-4 mt-1 ml-2">
            <button
              onClick={onReply}
              className="text-xs text-gray-500 hover:text-sky-500 flex items-center gap-1"
            >
              <Reply className="h-3.5 w-3.5" />
              Rispondi
            </button>
            {isOwner && (
              <button
                onClick={() => onDelete(comment.id)}
                className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Elimina
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
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

