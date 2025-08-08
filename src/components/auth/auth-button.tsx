'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { User, LogIn, LogOut, Shield, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/lib/toast'
import { useOAuthStatus } from '@/hooks/use-oauth-status'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { SmoothLink } from '@/components/ui/smooth-link'

interface AuthButtonProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

export function AuthButton({ 
  variant = 'default', 
  size = 'default',
  className 
}: AuthButtonProps) {
  const { data: session, status } = useSession()
  const { isConfigured, isDevelopment } = useOAuthStatus()
  const router = useRouter()
  const pathname = usePathname()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [signInAttempted, setSignInAttempted] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isNavigatingToProfile, setIsNavigatingToProfile] = useState(false)

  // Check if we're on admin page
  const isOnAdminPage = pathname?.startsWith('/admin')

  // Check admin status when session changes
  useEffect(() => {
    if (session && isSigningIn) {
      setIsSigningIn(false)
      toast.auth.signInSuccess(session.user?.name || undefined)
    }
    // Reset image error when session changes
    setImageError(false)
    
    // Check admin status
    if (session?.user?.email) {
      fetch('/api/admin/check')
        .then(res => res.json())
        .then(data => setIsAdmin(data.isAdmin))
        .catch(() => setIsAdmin(false))
    } else {
      setIsAdmin(false)
    }
  }, [session, isSigningIn])

  const handleSignIn = async () => {
    try {
      setSignInAttempted(true)
      setIsSigningIn(true)

      // Only show OAuth warning in development AND if not configured AND first attempt
      if (isDevelopment && !isConfigured && !signInAttempted) {
        toast.auth.oauthNotConfigured()
        // Still proceed with sign in attempt after a short delay
        setTimeout(() => {
          performSignIn()
        }, 2000)
        return
      }

      performSignIn()
    } catch (error) {
      setIsSigningIn(false)
      toast.auth.signInError(error instanceof Error ? error.message : undefined)
    }
  }

  const performSignIn = async () => {
    const loadingToast = toast.auth.signInStart()
    
    try {
      const result = await signIn('google', { 
        callbackUrl: '/',
        redirect: false, // Handle redirect manually for better UX
        // Always force Google account selection
        prompt: 'select_account'
      })

      if (result?.error) {
        toast.dismiss(loadingToast)
        setIsSigningIn(false)
        
        // Handle specific OAuth errors with helpful messages
        if (result.error === 'OAuthAccountNotLinked') {
          toast.auth.signInError('This email is already associated with a different sign-in method.')
        } else if (result.error === 'OAuthCallback') {
          toast.auth.signInError('OAuth configuration issue. Please contact support.')
        } else if (result.error === 'AccessDenied') {
          toast.auth.signInError('Access denied. Please try again or contact support.')
        } else {
          toast.auth.signInError(`Sign in failed: ${result.error}`)
        }
      } else if (result?.url) {
        // Success - redirect will happen automatically
        toast.dismiss(loadingToast)
        window.location.href = result.url
      }
    } catch (error) {
      toast.dismiss(loadingToast)
      setIsSigningIn(false)
      toast.auth.signInError(error instanceof Error ? error.message : 'An unexpected error occurred')
    }
  }

  const handleNavigateToProfile = () => {
    setIsNavigatingToProfile(true)
    router.push('/profile')
  }

  const handleSignOut = async () => {
    try {
      // Sign out from our app
      await signOut({ callbackUrl: '/' })
      // Best-effort: clear Google session selection cookie by hitting logout URL (non-blocking)
      try {
        // This doesn't expose tokens; it simply hints the browser to clear Google session chooser
        fetch('https://accounts.google.com/Logout', { mode: 'no-cors', keepalive: true }).catch(() => {})
      } catch {}
      toast.auth.signOutSuccess()
    } catch {
      toast.error('Sign out failed. Please try again.')
    }
  }

  if (status === 'loading' || isSigningIn) {
    return (
      <Button 
        variant={variant} 
        size={size} 
        disabled
        className={cn('min-w-[100px]', className)}
      >
        <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        <span className="hidden sm:inline-block ml-2">
          {isSigningIn ? 'Signing in...' : 'Loading...'}
        </span>
      </Button>
    )
  }

  if (session) {
    return (
      <div className="flex items-center gap-2">
        {/* Admin Dashboard Link (only show if admin and NOT on admin page) */}
        {isAdmin && !isOnAdminPage && (
          <SmoothLink href="/admin">
            <Button 
              variant="ghost" 
              size="sm"
              className="flex items-center gap-2 px-3 py-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 ease-out hover:scale-105 active:scale-95 group"
              title="Admin Dashboard"
            >
              <Shield className="w-4 h-4 transition-all duration-300 group-hover:fill-purple-600 dark:group-hover:fill-purple-400" />
              <span className="hidden md:inline-block text-sm font-medium">Admin</span>
            </Button>
          </SmoothLink>
        )}

        {/* Favorites Link (only show when on admin page) */}
        {isOnAdminPage && (
          <SmoothLink href="/favorites">
            <Button 
              variant="ghost" 
              size="sm"
              className="flex items-center gap-2 px-3 py-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 ease-out hover:scale-105 active:scale-95 group"
              title="My Favorites"
            >
              <Heart className="w-4 h-4 transition-all duration-300 group-hover:fill-red-600 dark:group-hover:fill-red-400" />
              <span className="hidden md:inline-block text-sm font-medium">Favorites</span>
            </Button>
          </SmoothLink>
        )}
        
        {/* User Profile Button - Clickable with navigation */}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleNavigateToProfile}
          disabled={isNavigatingToProfile}
          className="flex items-center gap-2 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 ease-out hover:scale-105 active:scale-95 disabled:opacity-50"
          title="Go to Profile"
        >
          {isNavigatingToProfile ? (
            <div className="w-6 h-6 flex items-center justify-center">
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            </div>
          ) : (
            <>
              {session.user?.image && !imageError ? (
                <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    width={24}
                    height={24}
                    className="object-cover w-6 h-6"
                    unoptimized
                    onError={(e) => {
                      console.warn('AuthButton - Image failed to load:', session.user?.image, e)
                      setImageError(true)
                    }}
                  />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                  {session.user?.name?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
                </div>
              )}
            </>
          )}
          <span className="hidden sm:inline-block text-sm">
            {isNavigatingToProfile ? 'Loading...' : session.user?.name?.split(' ')[0] || 'Profile'}
          </span>
        </Button>
        
        {/* Sign Out Button */}
        <Button
          variant={variant}
          size={size}
          onClick={handleSignOut}
          className={cn(
            'flex items-center gap-2 transition-all duration-200 ease-out hover:scale-105 active:scale-95 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400', 
            className
          )}
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline-block">Sign Out</span>
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSignIn}
      className={cn(
        'flex items-center gap-2 transition-all duration-200 ease-out hover:scale-105 active:scale-95 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400', 
        className
      )}
    >
      <LogIn className="w-4 h-4" />
      <span>Sign In</span>
    </Button>
  )
}
