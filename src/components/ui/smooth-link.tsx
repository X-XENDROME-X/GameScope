'use client'

import Link from 'next/link'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useNavigation } from '@/contexts/navigation-context'

interface SmoothLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
  replace?: boolean
  prefetch?: boolean
}

export function SmoothLink({ 
  href, 
  children, 
  className, 
  onClick,
  replace = false,
  prefetch = true 
}: SmoothLinkProps) {
  const { navigate, isNavigating } = useNavigation()
  const [isClicked, setIsClicked] = useState(false)

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    
    if (isNavigating) return // Prevent multiple clicks
    
    if (onClick) {
      onClick()
    }

    setIsClicked(true)
    
    await navigate(href, { replace })
    
    // Reset after navigation
    setTimeout(() => setIsClicked(false), 100)
  }

  return (
    <Link 
      href={href} 
      onClick={handleClick}
      prefetch={prefetch}
      className={cn(
        'transition-all duration-200 ease-out inline-block',
        (isNavigating || isClicked) && 'opacity-75 scale-[0.98] pointer-events-none',
        className
      )}
    >
      {children}
    </Link>
  )
}
