'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  variant?: 'default' | 'transparent'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showText?: boolean
  animated?: boolean
  gradientStyle?: 'default' | 'gaming' | 'neon' | 'rainbow'
  onClick?: () => void
}

export function Logo({ 
  variant = 'transparent', 
  size = 'md', 
  className,
  showText = true,
  animated = false,
  gradientStyle = 'default',
  onClick
}: LogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }

  const gradientClasses = {
    default: 'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600',
    gaming: 'gaming-gradient',
    neon: 'neon-gradient',
    rainbow: 'bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500'
  }

  const animationClasses = {
    default: 'animate-gradient',
    gaming: 'animate-rainbow-gradient',
    neon: 'animate-rainbow-gradient',
    rainbow: 'animate-rainbow-gradient'
  }

  const logoSrc = variant === 'transparent' ? '/Rlogo.png' : '/logo.png'

  return (
    <div 
      className={cn(
        'flex items-center space-x-3 transition-all duration-200', 
        onClick && 'cursor-pointer hover:opacity-80',
        className
      )}
      onClick={onClick}
    >
      <div className="relative">
        <Image
          src={logoSrc}
          alt="GameScope Logo"
          width={size === 'sm' ? 32 : size === 'md' ? 40 : size === 'lg' ? 48 : 64}
          height={size === 'sm' ? 32 : size === 'md' ? 40 : size === 'lg' ? 48 : 64}
          className={cn(
            sizeClasses[size], 
            'object-contain transition-all duration-300',
            // Apply gradient effects to the logo icon when animated
            animated && cn(
              'rounded-lg p-1',
              gradientClasses[gradientStyle],
              animationClasses[gradientStyle]
            )
          )}
          priority
        />
      </div>
      {showText && (
        <span className={cn(
          'font-bold text-gray-900 dark:text-white transition-all duration-300',
          size === 'sm' && 'text-lg',
          size === 'md' && 'text-xl',
          size === 'lg' && 'text-2xl',
          size === 'xl' && 'text-3xl'
          // Removed the glow effect for cleaner appearance
        )}>
          GameScope
        </span>
      )}
    </div>
  )
}
