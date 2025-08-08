'use client'

import { Logo } from './logo'
import { SmoothLink } from './smooth-link'

interface NavigableLogoProps {
  variant?: 'default' | 'transparent'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showText?: boolean
  animated?: boolean
  gradientStyle?: 'default' | 'gaming' | 'neon' | 'rainbow'
  href?: string
}

export function NavigableLogo({ 
  href = '/',
  ...logoProps
}: NavigableLogoProps) {
  return (
    <SmoothLink href={href} className="inline-block">
      <Logo {...logoProps} />
    </SmoothLink>
  )
}
