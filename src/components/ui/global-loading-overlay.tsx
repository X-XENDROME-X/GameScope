'use client'

import { useNavigation } from '@/contexts/navigation-context'
import { LoadingSpinner } from './loading-spinner'
import Image from 'next/image'

export function GlobalLoadingOverlay() {
  const { isNavigating, targetPath } = useNavigation()

  if (!isNavigating) return null

  // Determine loading message based on destination
  const getLoadingMessage = () => {
    if (targetPath === '/admin') return 'Loading Admin Dashboard...'
    if (targetPath === '/profile') return 'Loading Profile...'
    if (targetPath === '/') return 'Loading GameScope...'
    return 'Loading page...'
  }

  return (
    <div className="fixed inset-0 z-[9999] loading-backdrop flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700 animate-in">
        <div className="flex flex-col items-center gap-6">
          {/* Logo */}
          <div className="relative">
            <Image
              src="/Rlogo.png"
              alt="GameScope Logo"
              width={64}
              height={64}
              className="object-contain animate-pulse-glow"
              priority
            />
          </div>
          
          {/* Loading Spinner and Text */}
          <LoadingSpinner 
            size="lg" 
            text={getLoadingMessage()}
            className="flex-col gap-4"
          />
        </div>
      </div>
    </div>
  )
}
