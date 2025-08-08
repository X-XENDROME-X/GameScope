'use client'

import { useEffect, useState } from 'react'

// OAuth configuration checker for client-side
export function useOAuthStatus() {
  const [isConfigured, setIsConfigured] = useState(true) // Default to true to prevent flash
  
  useEffect(() => {
    // Only run on client side
    const checkOAuthConfig = () => {
      // In production, assume OAuth is configured
      if (process.env.NODE_ENV === 'production') return true
      
      // Check if OAuth is explicitly marked as configured
      if (process.env.NEXT_PUBLIC_OAUTH_CONFIGURED === 'true') return true
      
      // In development, check if we're on localhost
      if (typeof window !== 'undefined') {
        const currentUrl = window.location.origin
        const isLocalhost = currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1')
        
        // If not localhost (e.g., Vercel preview), assume configured
        return !isLocalhost
      }
      
      return true // Default to configured
    }
    
    setIsConfigured(checkOAuthConfig())
  }, [])

  return {
    isConfigured,
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development'
  }
}
