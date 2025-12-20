"use client"

import { useState } from 'react'
import Image, { ImageProps } from 'next/image'
import { cn } from '@/lib/utils'

// Simple SVG blur placeholder
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f0f9ff" offset="20%" />
      <stop stop-color="#e0f2fe" offset="50%" />
      <stop stop-color="#f0f9ff" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f0f9ff" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str)

const blurDataURL = (w = 700, h = 475) =>
  `data:image/svg+xml;base64,${toBase64(shimmer(w, h))}`

// Solid color placeholder
const solidPlaceholder = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88P/BfwYABQMB/xvNPBsAAAAASUVORK5CYII='

interface OptimizedImageProps extends Omit<ImageProps, 'placeholder' | 'blurDataURL'> {
  fallback?: string
  showSkeleton?: boolean
}

/**
 * Optimized Image component with blur placeholder and loading states
 */
export function OptimizedImage({
  src,
  alt,
  className,
  fallback = '/placeholder-image.jpg',
  showSkeleton = true,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  const imageSrc = error ? fallback : src

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {showSkeleton && isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-sky-50 via-sky-100 to-sky-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 animate-pulse" />
      )}
      <Image
        src={imageSrc}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        placeholder="blur"
        blurDataURL={blurDataURL()}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setError(true)
          setIsLoading(false)
        }}
        {...props}
      />
    </div>
  )
}

/**
 * Avatar image with fallback initials
 */
interface AvatarImageProps {
  src?: string | null
  alt: string
  fallbackText?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
}

export function AvatarImage({
  src,
  alt,
  fallbackText,
  size = 'md',
  className,
}: AvatarImageProps) {
  const [error, setError] = useState(false)
  const initials = fallbackText?.charAt(0).toUpperCase() || alt.charAt(0).toUpperCase() || 'U'

  if (!src || error) {
    return (
      <div
        className={cn(
          'rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-semibold',
          sizeClasses[size],
          className
        )}
      >
        {initials}
      </div>
    )
  }

  return (
    <div className={cn('relative rounded-full overflow-hidden', sizeClasses[size], className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        onError={() => setError(true)}
      />
    </div>
  )
}

/**
 * Background image with gradient overlay
 */
interface BackgroundImageProps {
  src: string
  alt?: string
  overlay?: 'none' | 'light' | 'dark' | 'gradient'
  children?: React.ReactNode
  className?: string
}

const overlayClasses = {
  none: '',
  light: 'bg-white/50',
  dark: 'bg-black/50',
  gradient: 'bg-gradient-to-t from-black/70 via-black/20 to-transparent',
}

export function BackgroundImage({
  src,
  alt = 'Background',
  overlay = 'gradient',
  children,
  className,
}: BackgroundImageProps) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        placeholder="blur"
        blurDataURL={blurDataURL()}
      />
      {overlay !== 'none' && (
        <div className={cn('absolute inset-0', overlayClasses[overlay])} />
      )}
      {children && (
        <div className="relative z-10">{children}</div>
      )}
    </div>
  )
}





"use client"

import { useState } from 'react'
import Image, { ImageProps } from 'next/image'
import { cn } from '@/lib/utils'

// Simple SVG blur placeholder
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f0f9ff" offset="20%" />
      <stop stop-color="#e0f2fe" offset="50%" />
      <stop stop-color="#f0f9ff" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f0f9ff" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str)

const blurDataURL = (w = 700, h = 475) =>
  `data:image/svg+xml;base64,${toBase64(shimmer(w, h))}`

// Solid color placeholder
const solidPlaceholder = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88P/BfwYABQMB/xvNPBsAAAAASUVORK5CYII='

interface OptimizedImageProps extends Omit<ImageProps, 'placeholder' | 'blurDataURL'> {
  fallback?: string
  showSkeleton?: boolean
}

/**
 * Optimized Image component with blur placeholder and loading states
 */
export function OptimizedImage({
  src,
  alt,
  className,
  fallback = '/placeholder-image.jpg',
  showSkeleton = true,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  const imageSrc = error ? fallback : src

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {showSkeleton && isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-sky-50 via-sky-100 to-sky-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 animate-pulse" />
      )}
      <Image
        src={imageSrc}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        placeholder="blur"
        blurDataURL={blurDataURL()}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setError(true)
          setIsLoading(false)
        }}
        {...props}
      />
    </div>
  )
}

/**
 * Avatar image with fallback initials
 */
interface AvatarImageProps {
  src?: string | null
  alt: string
  fallbackText?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
}

export function AvatarImage({
  src,
  alt,
  fallbackText,
  size = 'md',
  className,
}: AvatarImageProps) {
  const [error, setError] = useState(false)
  const initials = fallbackText?.charAt(0).toUpperCase() || alt.charAt(0).toUpperCase() || 'U'

  if (!src || error) {
    return (
      <div
        className={cn(
          'rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-semibold',
          sizeClasses[size],
          className
        )}
      >
        {initials}
      </div>
    )
  }

  return (
    <div className={cn('relative rounded-full overflow-hidden', sizeClasses[size], className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        onError={() => setError(true)}
      />
    </div>
  )
}

/**
 * Background image with gradient overlay
 */
interface BackgroundImageProps {
  src: string
  alt?: string
  overlay?: 'none' | 'light' | 'dark' | 'gradient'
  children?: React.ReactNode
  className?: string
}

const overlayClasses = {
  none: '',
  light: 'bg-white/50',
  dark: 'bg-black/50',
  gradient: 'bg-gradient-to-t from-black/70 via-black/20 to-transparent',
}

export function BackgroundImage({
  src,
  alt = 'Background',
  overlay = 'gradient',
  children,
  className,
}: BackgroundImageProps) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        placeholder="blur"
        blurDataURL={blurDataURL()}
      />
      {overlay !== 'none' && (
        <div className={cn('absolute inset-0', overlayClasses[overlay])} />
      )}
      {children && (
        <div className="relative z-10">{children}</div>
      )}
    </div>
  )
}






