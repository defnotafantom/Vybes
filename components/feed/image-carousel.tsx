"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface ImageCarouselProps {
  images: string[]
  aspectRatio?: "square" | "video" | "auto"
}

export function ImageCarousel({ images, aspectRatio = "auto" }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)

  const goNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  const goPrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  if (images.length === 0) return null

  if (images.length === 1) {
    return (
      <>
        <div
          className={cn(
            "relative rounded-xl overflow-hidden cursor-pointer",
            aspectRatio === "square" && "aspect-square",
            aspectRatio === "video" && "aspect-video"
          )}
          onClick={() => setShowLightbox(true)}
        >
          <Image
            src={images[0]}
            alt=""
            fill
            className="object-cover"
          />
        </div>
        <Lightbox
          images={images}
          currentIndex={currentIndex}
          isOpen={showLightbox}
          onClose={() => setShowLightbox(false)}
          onNext={goNext}
          onPrev={goPrev}
        />
      </>
    )
  }

  return (
    <>
      <div className="relative group">
        <div
          className={cn(
            "relative rounded-xl overflow-hidden cursor-pointer",
            aspectRatio === "square" && "aspect-square",
            aspectRatio === "video" && "aspect-video",
            aspectRatio === "auto" && "aspect-[4/3]"
          )}
          onClick={() => setShowLightbox(true)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <Image
                src={images[currentIndex]}
                alt=""
                fill
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={goPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={goNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Dots indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation()
                setCurrentIndex(idx)
              }}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all",
                idx === currentIndex
                  ? "bg-white w-4"
                  : "bg-white/50 hover:bg-white/80"
              )}
            />
          ))}
        </div>

        {/* Counter */}
        <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/50 text-white text-xs">
          {currentIndex + 1}/{images.length}
        </div>
      </div>

      <Lightbox
        images={images}
        currentIndex={currentIndex}
        isOpen={showLightbox}
        onClose={() => setShowLightbox(false)}
        onNext={goNext}
        onPrev={goPrev}
      />
    </>
  )
}

function Lightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrev,
}: {
  images: string[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onNext: () => void
  onPrev: () => void
}) {
  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="relative w-full max-w-5xl px-16" onClick={(e) => e.stopPropagation()}>
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-h-[90vh] w-auto mx-auto rounded-lg"
          />
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button
              onClick={onPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation()
              }}
              className={cn(
                "w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                idx === currentIndex ? "border-white" : "border-transparent opacity-50 hover:opacity-80"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  )
}

