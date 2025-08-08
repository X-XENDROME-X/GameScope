'use client'

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export function Skeleton({ className, rounded = 'md' }: SkeletonProps) {
  const roundedClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  }

  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 dark:bg-gray-700',
        roundedClasses[rounded],
        className
      )}
    />
  )
}

// Game Card Skeleton
export function GameCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="relative aspect-video">
        <Skeleton className="absolute inset-0" />
      </div>
      <div className="p-4">
        <Skeleton className="h-6 mb-2" />
        <Skeleton className="h-4 w-3/5 mb-3" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-4" rounded="sm" />
            <Skeleton className="w-12 h-4" rounded="sm" />
          </div>
          <Skeleton className="w-8 h-8" rounded="full" />
        </div>
        <div className="mt-3 flex gap-1">
          <Skeleton className="w-6 h-6" rounded="sm" />
          <Skeleton className="w-6 h-6" rounded="sm" />
          <Skeleton className="w-6 h-6" rounded="sm" />
        </div>
      </div>
    </div>
  )
}

// Game List Item Skeleton
export function GameListSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex gap-4">
        <Skeleton className="w-24 h-24 flex-shrink-0" rounded="lg" />
        <div className="flex-1 min-w-0">
          <Skeleton className="h-6 w-2/3 mb-2" />
          <Skeleton className="h-4 w-2/5 mb-2" />
          <Skeleton className="h-3 w-full mb-1" />
          <Skeleton className="h-3 w-3/5" />
        </div>
      </div>
    </div>
  )
}

// Header Skeleton
export function HeaderSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Skeleton className="w-8 h-8" rounded="sm" />
            <Skeleton className="w-32 h-6" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="w-64 h-10" rounded="lg" />
            <Skeleton className="w-10 h-10" rounded="full" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Filter Skeleton
export function FilterSkeleton() {
  return (
    <div className="flex flex-wrap gap-4 p-4">
      <Skeleton className="w-32 h-10" rounded="lg" />
      <Skeleton className="w-24 h-10" rounded="lg" />
      <Skeleton className="w-40 h-10" rounded="lg" />
      <Skeleton className="w-28 h-10" rounded="lg" />
    </div>
  )
}
