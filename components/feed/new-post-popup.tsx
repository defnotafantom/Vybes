"use client"

import React, { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { useLanguage } from "@/components/providers/language-provider"
import { useToast } from "@/hooks/use-toast"
import { prepareMediaForUpload } from "@/lib/image-upload-client"

interface Tag {
  id: number | string
  name: string
}

interface NewPostPopupProps {
  isOpen: boolean
  onClose: () => void
  artTags?: Tag[]
  onPostSubmit: (data: { title: string; description: string; tags: string[]; fileUrl?: string | null }) => Promise<void>
}

export function NewPostPopup({ isOpen, onClose, artTags = [], onPostSubmit }: NewPostPopupProps) {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) return

    setLoading(true)
    try {
      let fileUrl = null
      
      // Upload file if present
      if (file) {
        const prepared = await prepareMediaForUpload(file, 'posts')
        const uploadFormData = new FormData()
        uploadFormData.append('file', prepared)
        uploadFormData.append('folder', 'posts')
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        })
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          fileUrl = uploadData.url
        } else {
          const err = await uploadResponse.json().catch(() => ({}))
          throw new Error(err?.error || t('feed.newPost.uploadError'))
        }
      }
      
      await onPostSubmit({ title, description, tags, fileUrl })
      setTitle("")
      setDescription("")
      setTags([])
      setFile(null)
      onClose()
    } catch (error) {
      console.error("Error submitting post:", error)
      toast({
        title: t('toast.genericError'),
        description: error instanceof Error ? error.message : t('feed.newPost.retry'),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex justify-center items-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl w-full max-w-lg rounded-2xl shadow-2xl border border-sky-100 dark:border-sky-900 p-6 relative"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t('feed.newPost.title')}</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors"
                >
                  <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder={t('common.title')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-white dark:bg-gray-700 border-2 border-sky-200 dark:border-sky-800"
                />

                <textarea
                  placeholder={t('common.description')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-[120px] rounded-xl border-2 border-sky-200 dark:border-sky-800 bg-white dark:bg-gray-700 px-4 py-3 text-sm ring-offset-background placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:border-sky-500 transition-all resize-none"
                />

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">{t('feed.newPost.fileLabel')}:</span>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
                    className="block w-full text-sm text-slate-600 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-sky-500 file:to-blue-600 file:text-white hover:file:from-sky-600 hover:file:to-blue-700 file:cursor-pointer"
                  />
                  <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    Media: immagini (JPG/PNG/WebP/GIF) o video (MP4/WebM). Ottimizzazione automatica per le immagini.
                  </div>
                </label>

                <div>
                  <p className="font-semibold mb-2 text-slate-700 dark:text-slate-300">{t('feed.newPost.tags')}</p>
                  <div className="flex gap-2 flex-wrap">
                    {artTags.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() =>
                          setTags((prev) =>
                            prev.includes(tag.name) ? prev.filter((t) => t !== tag.name) : [...prev, tag.name]
                          )
                        }
                        className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                          tags.includes(tag.name)
                            ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30"
                            : "bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm text-slate-700 dark:text-slate-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                        }`}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button onClick={onClose} variant="outline" disabled={loading}>
                    {t('feed.newPost.cancel')}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!title.trim() || !description.trim() || loading}
                    className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
                  >
                    {loading ? t('feed.newPost.publishing') : t('feed.newPost.publish')}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

