'use client'

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  className,
  text = 'Loading...'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div className={cn('flex items-center justify-center gap-3', className)}>
      <div 
        className={cn(
          'animate-spin rounded-full border-2 border-blue-600 border-t-transparent',
          sizeClasses[size]
        )}
      />
      {text && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {text}
        </span>
      )}
    </div>
  )
}
