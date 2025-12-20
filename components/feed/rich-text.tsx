"use client"

import Link from "next/link"
import { Fragment } from "react"

interface RichTextProps {
  text: string
  onHashtagClick?: (tag: string) => void
}

// Parse text and convert @mentions and #hashtags to clickable links
export function RichText({ text, onHashtagClick }: RichTextProps) {
  // Regex to match @mentions and #hashtags
  const regex = /(@\w+|#\w+|https?:\/\/[^\s]+)/g
  const parts = text.split(regex)

  return (
    <span>
      {parts.map((part, i) => {
        if (!part) return null

        // @mention
        if (part.startsWith("@")) {
          const username = part.slice(1)
          return (
            <Link
              key={i}
              href={`/dashboard/users/search?q=${username}`}
              className="text-sky-500 hover:text-sky-600 hover:underline font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </Link>
          )
        }

        // #hashtag
        if (part.startsWith("#")) {
          const tag = part.slice(1)
          return (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation()
                onHashtagClick?.(tag)
              }}
              className="text-sky-500 hover:text-sky-600 hover:underline font-medium"
            >
              {part}
            </button>
          )
        }

        // URL
        if (part.startsWith("http://") || part.startsWith("https://")) {
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-500 hover:text-sky-600 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {truncateUrl(part)}
            </a>
          )
        }

        // Normal text
        return <Fragment key={i}>{part}</Fragment>
      })}
    </span>
  )
}

function truncateUrl(url: string, maxLength = 40): string {
  try {
    const parsed = new URL(url)
    const display = parsed.hostname + parsed.pathname
    if (display.length > maxLength) {
      return display.slice(0, maxLength - 3) + "..."
    }
    return display
  } catch {
    return url.length > maxLength ? url.slice(0, maxLength - 3) + "..." : url
  }
}

// Extract hashtags from text
export function extractHashtags(text: string): string[] {
  const matches = text.match(/#\w+/g) || []
  return matches.map((tag) => tag.slice(1))
}

// Extract mentions from text  
export function extractMentions(text: string): string[] {
  const matches = text.match(/@\w+/g) || []
  return matches.map((mention) => mention.slice(1))
}





"use client"

import Link from "next/link"
import { Fragment } from "react"

interface RichTextProps {
  text: string
  onHashtagClick?: (tag: string) => void
}

// Parse text and convert @mentions and #hashtags to clickable links
export function RichText({ text, onHashtagClick }: RichTextProps) {
  // Regex to match @mentions and #hashtags
  const regex = /(@\w+|#\w+|https?:\/\/[^\s]+)/g
  const parts = text.split(regex)

  return (
    <span>
      {parts.map((part, i) => {
        if (!part) return null

        // @mention
        if (part.startsWith("@")) {
          const username = part.slice(1)
          return (
            <Link
              key={i}
              href={`/dashboard/users/search?q=${username}`}
              className="text-sky-500 hover:text-sky-600 hover:underline font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </Link>
          )
        }

        // #hashtag
        if (part.startsWith("#")) {
          const tag = part.slice(1)
          return (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation()
                onHashtagClick?.(tag)
              }}
              className="text-sky-500 hover:text-sky-600 hover:underline font-medium"
            >
              {part}
            </button>
          )
        }

        // URL
        if (part.startsWith("http://") || part.startsWith("https://")) {
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-500 hover:text-sky-600 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {truncateUrl(part)}
            </a>
          )
        }

        // Normal text
        return <Fragment key={i}>{part}</Fragment>
      })}
    </span>
  )
}

function truncateUrl(url: string, maxLength = 40): string {
  try {
    const parsed = new URL(url)
    const display = parsed.hostname + parsed.pathname
    if (display.length > maxLength) {
      return display.slice(0, maxLength - 3) + "..."
    }
    return display
  } catch {
    return url.length > maxLength ? url.slice(0, maxLength - 3) + "..." : url
  }
}

// Extract hashtags from text
export function extractHashtags(text: string): string[] {
  const matches = text.match(/#\w+/g) || []
  return matches.map((tag) => tag.slice(1))
}

// Extract mentions from text  
export function extractMentions(text: string): string[] {
  const matches = text.match(/@\w+/g) || []
  return matches.map((mention) => mention.slice(1))
}






