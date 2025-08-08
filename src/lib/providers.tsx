'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/components/auth/auth-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
            refetchOnWindowFocus: false, // Prevent unnecessary refetches
            refetchOnReconnect: 'always', // Refetch when reconnecting
            retry: (failureCount, error: Error & { status?: number }) => {
              // Smart retry logic
              if (error?.status === 404) return false
              if (error?.status && error.status >= 500) return failureCount < 2
              return failureCount < 1
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            retry: 1,
            retryDelay: 1000,
          },
        },
      })
  )

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        
        {/* Professional toast system with perfect positioning */}
        <Toaster
          position="bottom-right"
          gutter={12}
          containerClassName="!bottom-4 sm:!bottom-6"
          containerStyle={{
            bottom: '16px',
            right: '16px',
            zIndex: 9999,
            maxWidth: '400px',
          }}
          toastOptions={{
            // Consistent styling for all toasts
            duration: 4000,
            className: 'toast-custom',
            style: {
              background: '#ffffff',
              color: '#1f2937',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500',
              maxWidth: '380px',
              minWidth: '300px',
              padding: '16px 18px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(12px)',
              wordWrap: 'break-word',
              lineHeight: '1.5',
              transform: 'translateZ(0)', // Hardware acceleration
            },
            // Remove default styling variations since we handle them in toast.ts
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              duration: 6000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
            loading: {
              duration: Infinity,
              iconTheme: {
                primary: '#6b7280',
                secondary: '#ffffff',
              },
            },
          }}
        />
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </AuthProvider>
  )
}
