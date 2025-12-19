"use client"

import { useState, useEffect, useCallback } from "react"
import { X, ChevronLeft, ChevronRight, Eye, Pause, Play } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { it } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface Story {
  id: string
  mediaUrl: string
  mediaType: string
  caption?: string
  createdAt: string
  expiresAt: string
  views: { userId: string }[]
}

interface UserStories {
  userId: string
  user: {
    id: string
    name: string | null
    username: string | null
    image: string | null
  }
  stories: Story[]
}

interface StoryViewerProps {
  userStories: UserStories
  initialIndex?: number
  currentUserId?: string
  onClose: () => void
  onNext: () => void
}

export function StoryViewer({
  userStories,
  initialIndex = 0,
  currentUserId,
  onClose,
  onNext,
}: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const story = userStories.stories[currentIndex]
  const STORY_DURATION = 5000 // 5 seconds

  // Mark as viewed
  useEffect(() => {
    if (story && currentUserId) {
      fetch(`/api/stories/${story.id}/view`, { method: "POST" })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id, currentUserId])

  // Progress timer
  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Go to next story
          if (currentIndex < userStories.stories.length - 1) {
            setCurrentIndex((i) => i + 1)
            return 0
          } else {
            onNext()
            return 0
          }
        }
        return prev + (100 / (STORY_DURATION / 100))
      })
    }, 100)

    return () => clearInterval(interval)
  }, [currentIndex, isPaused, userStories.stories.length, onNext])

  // Reset progress when story changes
  useEffect(() => {
    setProgress(0)
  }, [currentIndex])

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1)
      setProgress(0)
    }
  }, [currentIndex])

  const goToNext = useCallback(() => {
    if (currentIndex < userStories.stories.length - 1) {
      setCurrentIndex((i) => i + 1)
      setProgress(0)
    } else {
      onNext()
    }
  }, [currentIndex, userStories.stories.length, onNext])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPrev()
      if (e.key === "ArrowRight") goToNext()
      if (e.key === "Escape") onClose()
      if (e.key === " ") setIsPaused((p) => !p)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [goToPrev, goToNext, onClose])

  if (!story) return null

  const isOwner = currentUserId === userStories.userId

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-[200] flex items-center justify-center"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white z-50"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Story container */}
      <div className="relative w-full max-w-md h-full max-h-[90vh] mx-4">
        {/* Progress bars */}
        <div className="absolute top-4 left-4 right-4 flex gap-1 z-40">
          {userStories.stories.map((_, idx) => (
            <div
              key={idx}
              className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-white transition-all duration-100"
                style={{
                  width: idx < currentIndex ? "100%" : idx === currentIndex ? `${progress}%` : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-40">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-white">
              <AvatarImage src={userStories.user.image || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-sky-400 to-blue-500 text-white">
                {(userStories.user.name || "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white font-medium text-sm">
                {userStories.user.name || userStories.user.username}
              </p>
              <p className="text-white/70 text-xs">
                {formatDistanceToNow(new Date(story.createdAt), { addSuffix: true, locale: it })}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsPaused((p) => !p)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20"
          >
            {isPaused ? (
              <Play className="h-4 w-4 text-white" />
            ) : (
              <Pause className="h-4 w-4 text-white" />
            )}
          </button>
        </div>

        {/* Media */}
        <div
          className="w-full h-full rounded-2xl overflow-hidden bg-gray-900"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const x = e.clientX - rect.left
            if (x < rect.width / 3) goToPrev()
            else if (x > (rect.width * 2) / 3) goToNext()
            else setIsPaused((p) => !p)
          }}
        >
          {story.mediaType === "video" ? (
            <video
              src={story.mediaUrl}
              className="w-full h-full object-contain"
              autoPlay
              muted
              playsInline
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={story.mediaUrl}
              alt=""
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Caption */}
        {story.caption && (
          <div className="absolute bottom-20 left-4 right-4 z-40">
            <p className="text-white text-center bg-black/50 rounded-xl px-4 py-2 backdrop-blur-sm">
              {story.caption}
            </p>
          </div>
        )}

        {/* Views (only for owner) */}
        {isOwner && (
          <div className="absolute bottom-4 left-4 right-4 z-40">
            <div className="flex items-center justify-center gap-2 text-white/70 text-sm">
              <Eye className="h-4 w-4" />
              <span>{story.views.length} visualizzazioni</span>
            </div>
          </div>
        )}

        {/* Navigation areas */}
        <button
          onClick={goToPrev}
          className="absolute left-0 top-0 bottom-0 w-1/3 z-30"
          aria-label="Previous"
        />
        <button
          onClick={goToNext}
          className="absolute right-0 top-0 bottom-0 w-1/3 z-30"
          aria-label="Next"
        />
      </div>
    </motion.div>
  )
}



