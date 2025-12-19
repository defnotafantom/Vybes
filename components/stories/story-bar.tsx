"use client"

import { useState, useEffect, useRef } from "react"
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { StoryViewer } from "./story-viewer"
import { StoryCreator } from "./story-creator"

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
  hasUnviewed: boolean
}

interface StoryBarProps {
  currentUserId?: string
}

export function StoryBar({ currentUserId }: StoryBarProps) {
  const [userStories, setUserStories] = useState<UserStories[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreator, setShowCreator] = useState(false)
  const [viewingStories, setViewingStories] = useState<UserStories | null>(null)
  const [viewingIndex, setViewingIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    fetchStories()
  }, [])

  const fetchStories = async () => {
    try {
      const res = await fetch("/api/stories")
      if (res.ok) {
        const data = await res.json()
        setUserStories(data.stories || [])
      }
    } catch (error) {
      console.error("Error fetching stories:", error)
    } finally {
      setLoading(false)
    }
  }

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener("resize", checkScroll)
    return () => window.removeEventListener("resize", checkScroll)
  }, [userStories])

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
      setTimeout(checkScroll, 300)
    }
  }

  const handleStoryClick = (userStory: UserStories, index: number = 0) => {
    setViewingStories(userStory)
    setViewingIndex(index)
  }

  const handleStoryCreated = () => {
    setShowCreator(false)
    fetchStories()
  }

  if (loading) {
    return (
      <div className="flex gap-4 p-4 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="w-12 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="relative">
        {/* Scroll buttons */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        {/* Stories scroll container */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 p-4 overflow-x-auto scrollbar-hide scroll-smooth"
        >
          {/* Add story button */}
          {currentUserId && (
            <button
              onClick={() => setShowCreator(true)}
              className="flex flex-col items-center gap-2 flex-shrink-0"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow">
                  <Plus className="h-6 w-6" />
                </div>
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                La tua storia
              </span>
            </button>
          )}

          {/* User stories */}
          {userStories.map((userStory) => (
            <button
              key={userStory.userId}
              onClick={() => handleStoryClick(userStory)}
              className="flex flex-col items-center gap-2 flex-shrink-0 group"
            >
              <div
                className={cn(
                  "p-0.5 rounded-full",
                  userStory.hasUnviewed
                    ? "bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500"
                    : "bg-gray-300 dark:bg-gray-600"
                )}
              >
                <div className="p-0.5 bg-white dark:bg-gray-900 rounded-full">
                  <Avatar className="h-14 w-14 group-hover:scale-105 transition-transform">
                    <AvatarImage src={userStory.user.image || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-sky-400 to-blue-500 text-white">
                      {(userStory.user.name || userStory.user.username || "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium truncate max-w-[64px]">
                {userStory.user.name || userStory.user.username}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Story Creator Modal */}
      <AnimatePresence>
        {showCreator && (
          <StoryCreator
            onClose={() => setShowCreator(false)}
            onCreated={handleStoryCreated}
          />
        )}
      </AnimatePresence>

      {/* Story Viewer Modal */}
      <AnimatePresence>
        {viewingStories && (
          <StoryViewer
            userStories={viewingStories}
            initialIndex={viewingIndex}
            currentUserId={currentUserId}
            onClose={() => setViewingStories(null)}
            onNext={() => {
              const currentIdx = userStories.findIndex(u => u.userId === viewingStories.userId)
              if (currentIdx < userStories.length - 1) {
                setViewingStories(userStories[currentIdx + 1])
                setViewingIndex(0)
              } else {
                setViewingStories(null)
              }
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}





