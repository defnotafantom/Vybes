"use client"

import { useState } from "react"
import { X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

interface EditPostModalProps {
  isOpen: boolean
  onClose: () => void
  post: {
    id: string
    content: string
    images?: string[]
    tags?: string[]
  }
  onSave: (postId: string, data: { content: string; tags: string[] }) => void
}

export function EditPostModal({ isOpen, onClose, post, onSave }: EditPostModalProps) {
  const { toast } = useToast()
  const [content, setContent] = useState(post.content)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSave = async () => {
    if (!content.trim()) {
      toast({ title: "Errore", description: "Il contenuto non può essere vuoto", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      })

      if (res.ok) {
        toast({ title: "Post aggiornato", description: "Le modifiche sono state salvate" })
        onSave(post.id, { content: content.trim(), tags: post.tags || [] })
        onClose()
      } else {
        throw new Error()
      }
    } catch {
      toast({ title: "Errore", description: "Impossibile salvare le modifiche", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Modifica Post</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-[150px] rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:border-sky-500 transition-colors resize-none"
                placeholder="Scrivi qualcosa..."
              />

              {post.images && post.images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {post.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt=""
                      className="h-20 w-20 rounded-lg object-cover flex-shrink-0"
                    />
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button onClick={onClose} variant="outline" disabled={loading} className="rounded-xl">
                  Annulla
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={loading || !content.trim()}
                  className="bg-sky-500 hover:bg-sky-600 rounded-xl"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salva"}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
