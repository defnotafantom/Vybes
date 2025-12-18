"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { X, AtSign, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { useLanguage } from "@/components/providers/language-provider"
import { useToast } from "@/hooks/use-toast"
import { prepareMediaForUpload } from "@/lib/image-upload-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Tag {
  id: number | string
  name: string
}

interface UserSuggestion {
  id: string
  name: string | null
  username: string | null
  image: string | null
}

interface NewPostPopupProps {
  isOpen: boolean
  onClose: () => void
  artTags?: Tag[]
  onPostSubmit: (data: { title: string; description: string; tags: string[]; fileUrl?: string | null; mentions?: string[] }) => Promise<void>
}

export function NewPostPopup({ isOpen, onClose, artTags = [], onPostSubmit }: NewPostPopupProps) {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  
  // Mention state
  const [showMentions, setShowMentions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState("")
  const [mentionSuggestions, setMentionSuggestions] = useState<UserSuggestion[]>([])
  const [mentionLoading, setMentionLoading] = useState(false)
  const [cursorPosition, setCursorPosition] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Search users for @ mentions
  const searchUsers = useCallback(async (query: string) => {
    if (query.length < 1) {
      setMentionSuggestions([])
      return
    }
    
    setMentionLoading(true)
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}&limit=5`)
      if (res.ok) {
        const data = await res.json()
        setMentionSuggestions(data.users || [])
      }
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setMentionLoading(false)
    }
  }, [])

  if (!isOpen) return null

  // Handle text change and detect @ mentions
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const pos = e.target.selectionStart || 0
    setDescription(value)
    setCursorPosition(pos)

    // Check for @ mention
    const textBeforeCursor = value.substring(0, pos)
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/)
    
    if (mentionMatch) {
      setShowMentions(true)
      setMentionQuery(mentionMatch[1])
      searchUsers(mentionMatch[1])
    } else {
      setShowMentions(false)
      setMentionQuery("")
    }
  }

  // Insert mention into text
  const insertMention = (user: UserSuggestion) => {
    const textBeforeCursor = description.substring(0, cursorPosition)
    const textAfterCursor = description.substring(cursorPosition)
    
    // Find the @ position
    const mentionStart = textBeforeCursor.lastIndexOf('@')
    const newText = textBeforeCursor.substring(0, mentionStart) + 
      `@${user.username || user.name} ` + 
      textAfterCursor
    
    setDescription(newText)
    setShowMentions(false)
    setMentionQuery("")
    
    // Focus textarea
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 0)
  }

  // Extract mentions from text
  const extractMentions = (text: string): string[] => {
    const mentions = text.match(/@(\w+)/g) || []
    return mentions.map(m => m.substring(1))
  }

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) return

    setLoading(true)
    try {
      let fileUrl = null
      
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
      
      const mentions = extractMentions(description)
      await onPostSubmit({ title, description, tags, fileUrl, mentions })
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
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('feed.newPost.title')}</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder={t('common.title')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-xl"
                />

                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    placeholder={`${t('common.description')} (usa @ per menzionare utenti)`}
                    value={description}
                    onChange={handleDescriptionChange}
                    className="w-full min-h-[120px] rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:border-sky-500 transition-colors resize-none"
                  />
                  
                  {/* Mention suggestions dropdown */}
                  <AnimatePresence>
                    {showMentions && (mentionSuggestions.length > 0 || mentionLoading) && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg z-10 overflow-hidden"
                      >
                        {mentionLoading ? (
                          <div className="p-3 flex items-center justify-center text-gray-500">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Ricerca...
                          </div>
                        ) : (
                          mentionSuggestions.map((user) => (
                            <button
                              key={user.id}
                              onClick={() => insertMention(user)}
                              className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.image || undefined} />
                                <AvatarFallback className="bg-gradient-to-br from-sky-400 to-blue-500 text-white text-xs">
                                  {(user.name || user.username || 'U').charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-sm text-gray-900 dark:text-white">
                                  {user.name || user.username}
                                </div>
                                {user.username && (
                                  <div className="text-xs text-gray-500">@{user.username}</div>
                                )}
                              </div>
                            </button>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <AtSign className="h-4 w-4" />
                  <span>Digita @ per menzionare altri utenti</span>
                </div>

                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">{t('feed.newPost.fileLabel')}:</span>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-sky-500 file:text-white hover:file:bg-sky-600 file:cursor-pointer"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Immagini (JPG/PNG/WebP/GIF) o video (MP4/WebM)
                  </p>
                </label>

                <div>
                  <p className="font-medium mb-2 text-gray-700 dark:text-gray-300 text-sm">{t('feed.newPost.tags')}</p>
                  <div className="flex gap-2 flex-wrap">
                    {artTags.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() =>
                          setTags((prev) =>
                            prev.includes(tag.name) ? prev.filter((t) => t !== tag.name) : [...prev, tag.name]
                          )
                        }
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          tags.includes(tag.name)
                            ? "bg-sky-500 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button onClick={onClose} variant="outline" disabled={loading} className="rounded-xl">
                    {t('feed.newPost.cancel')}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!title.trim() || !description.trim() || loading}
                    className="bg-sky-500 hover:bg-sky-600 rounded-xl"
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
