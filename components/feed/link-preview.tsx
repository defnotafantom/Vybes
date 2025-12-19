"use client"

import { useState, useEffect } from "react"
import { ExternalLink } from "lucide-react"
import { motion } from "framer-motion"

interface LinkPreviewData {
  url: string
  title: string | null
  description: string | null
  image: string | null
  siteName: string | null
}

interface LinkPreviewProps {
  url: string
}

export function LinkPreview({ url }: LinkPreviewProps) {
  const [preview, setPreview] = useState<LinkPreviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const res = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`)
        if (res.ok) {
          const data = await res.json()
          setPreview(data)
        } else {
          setError(true)
        }
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchPreview()
  }, [url])

  if (loading) {
    return (
      <div className="mt-3 rounded-xl border border-gray-200 dark:border-gray-700 p-3 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
      </div>
    )
  }

  if (error || !preview) {
    return null
  }

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 block rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-sky-500 transition-colors group"
    >
      {preview.image && (
        <div className="aspect-video relative overflow-hidden bg-gray-100 dark:bg-gray-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview.image}
            alt={preview.title || "Preview"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-3">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
          <ExternalLink className="h-3 w-3" />
          {preview.siteName || new URL(url).hostname}
        </div>
        {preview.title && (
          <h4 className="font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-sky-500 transition-colors">
            {preview.title}
          </h4>
        )}
        {preview.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mt-1">
            {preview.description}
          </p>
        )}
      </div>
    </motion.a>
  )
}

// Extract URLs from text
export function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  return text.match(urlRegex) || []
}



