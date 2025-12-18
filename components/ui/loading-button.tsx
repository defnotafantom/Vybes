"use client"

import { forwardRef, ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  loadingText?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ 
    children, 
    loading = false, 
    loadingText,
    disabled, 
    className,
    variant = 'default',
    size = 'default',
    ...props 
  }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        disabled={disabled || loading}
        className={cn(
          'relative transition-all',
          loading && 'cursor-not-allowed',
          className
        )}
        {...props}
      >
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {loading && loadingText ? loadingText : children}
      </Button>
    )
  }
)

LoadingButton.displayName = 'LoadingButton'

/**
 * Hook to manage button loading state with auto-reset
 */
import { useState, useCallback } from 'react'

export function useLoadingState(initialState = false) {
  const [loading, setLoading] = useState(initialState)

  const withLoading = useCallback(async <T,>(fn: () => Promise<T>): Promise<T | null> => {
    if (loading) return null
    setLoading(true)
    try {
      return await fn()
    } finally {
      setLoading(false)
    }
  }, [loading])

  return { loading, setLoading, withLoading }
}

/**
 * Async button that handles loading state automatically
 */
interface AsyncButtonProps extends Omit<LoadingButtonProps, 'onClick'> {
  onClick: () => Promise<void>
}

export function AsyncButton({ onClick, children, ...props }: AsyncButtonProps) {
  const { loading, withLoading } = useLoadingState()

  const handleClick = () => {
    withLoading(onClick)
  }

  return (
    <LoadingButton loading={loading} onClick={handleClick} {...props}>
      {children}
    </LoadingButton>
  )
}

