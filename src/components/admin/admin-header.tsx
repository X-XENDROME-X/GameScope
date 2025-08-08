'use client'

import { NavigableLogo } from '@/components/ui/navigable-logo'
import { AuthButton } from '@/components/auth/auth-button'

export function AdminHeader() {
  return (
    <header className="relative">
      {/* Navigation Bar Only - No Hero Section */}
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <NavigableLogo 
                  variant="transparent" 
                  size="md" 
                  animated={true}
                  href="/"
                />
              </div>
            </div>

            {/* Right side - Auth only */}
            <div className="flex items-center space-x-2">
              <AuthButton />
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
