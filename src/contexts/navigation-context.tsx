'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface NavigationContextType {
  isNavigating: boolean
  targetPath: string | null
  navigate: (href: string, options?: { replace?: boolean }) => Promise<void>
  setPageLoaded: () => void
}

const NavigationContext = createContext<NavigationContextType>({
  isNavigating: false,
  targetPath: null,
  navigate: async () => {},
  setPageLoaded: () => {},
})

export function useNavigation() {
  return useContext(NavigationContext)
}

interface NavigationProviderProps {
  children: ReactNode
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const [isNavigating, setIsNavigating] = useState(false)
  const [targetPath, setTargetPath] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Listen for pathname changes to detect when navigation is complete
  useEffect(() => {
    if (isNavigating && targetPath && pathname === targetPath) {
      // Add a small delay to ensure the page is fully rendered
      const timer = setTimeout(() => {
        setIsNavigating(false)
        setTargetPath(null)
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [pathname, isNavigating, targetPath])

  const navigate = useCallback(async (href: string, options?: { replace?: boolean }) => {
    // Don't navigate if already navigating to the same path
    if (isNavigating && targetPath === href) return
    
    // Don't navigate if we're already on the target path
    if (pathname === href) return

    setIsNavigating(true)
    setTargetPath(href)
    
    try {
      // Add a small delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 100))
      
      if (options?.replace) {
        router.replace(href)
      } else {
        router.push(href)
      }
    } catch (error) {
      console.error('Navigation error:', error)
      setIsNavigating(false)
      setTargetPath(null)
    }
  }, [isNavigating, targetPath, pathname, router])

  const setPageLoaded = useCallback(() => {
    setIsNavigating(false)
    setTargetPath(null)
  }, [])

  return (
    <NavigationContext.Provider value={{ isNavigating, targetPath, navigate, setPageLoaded }}>
      {children}
    </NavigationContext.Provider>
  )
}
