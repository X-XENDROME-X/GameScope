import { toast as hotToast } from 'react-hot-toast'

// Track active toasts to prevent duplicates
const activeToasts = new Map<string, string>()

// Enhanced toast wrapper with deduplication and better UX
export const toast = {
  // Core dismiss function
  dismiss: (toastId?: string) => {
    hotToast.dismiss(toastId)
    if (toastId) {
      // Remove from tracking
      for (const [key, id] of activeToasts.entries()) {
        if (id === toastId) {
          activeToasts.delete(key)
          break
        }
      }
    }
  },

  // Dismiss all toasts
  dismissAll: () => {
    hotToast.dismiss()
    activeToasts.clear()
  },

  // Private method to handle deduplication
  _showToast: (type: 'success' | 'error' | 'loading' | 'info', message: string, options: {
    dedupe?: boolean
    dedupeKey?: string
    duration?: number
    [key: string]: unknown
  } = {}) => {
    const { dedupe = true, dedupeKey, duration: optionsDuration, ...toastOptions } = options
    
    // Create deduplication key
    const key = dedupeKey || `${type}:${message}`
    
    // If deduplication is enabled and this toast is already active, dismiss the old one
    if (dedupe && activeToasts.has(key)) {
      const existingToastId = activeToasts.get(key)
      if (existingToastId) {
        hotToast.dismiss(existingToastId)
      }
    }
    
    // Show the new toast
    let toastId: string
    const defaultDuration = type === 'error' ? 5000 : type === 'loading' ? Infinity : 4000
    const duration = optionsDuration || defaultDuration
    
    switch (type) {
      case 'success':
        toastId = hotToast.success(message, { ...toastOptions, duration })
        break
      case 'error':
        toastId = hotToast.error(message, { ...toastOptions, duration })
        break
      case 'loading':
        toastId = hotToast.loading(message, toastOptions)
        break
      case 'info':
        toastId = hotToast(message, { icon: 'ℹ️', ...toastOptions, duration })
        break
      default:
        toastId = hotToast(message, { ...toastOptions, duration })
    }
    
    // Track the toast
    if (dedupe) {
      activeToasts.set(key, toastId)
      
      // Auto-cleanup after toast duration
      if (duration !== Infinity) {
        setTimeout(() => {
          activeToasts.delete(key)
        }, duration + 100) // Add small buffer
      }
    }
    
    return toastId
  },
  
  success: (message: string, options?: { 
    duration?: number
    dedupe?: boolean
    dedupeKey?: string
  }) => {
    return toast._showToast('success', message, {
      duration: options?.duration || 3000,
      dedupe: options?.dedupe,
      dedupeKey: options?.dedupeKey,
      style: {
        background: '#f0f9ff',
        color: '#0c4a6e',
        border: '1px solid #0ea5e9',
        borderRadius: '12px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      iconTheme: {
        primary: '#0ea5e9',
        secondary: '#f0f9ff',
      },
    })
  },

  error: (message: string, options?: { 
    duration?: number
    persistent?: boolean
    dedupe?: boolean
    dedupeKey?: string
  }) => {
    return toast._showToast('error', message, {
      duration: options?.persistent ? 8000 : (options?.duration || 5000),
      dedupe: options?.dedupe,
      dedupeKey: options?.dedupeKey,
      style: {
        background: '#fef2f2',
        color: '#991b1b',
        border: '1px solid #ef4444',
        borderRadius: '12px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      iconTheme: {
        primary: '#ef4444',
        secondary: '#fef2f2',
      },
    })
  },

  loading: (message: string, options?: { 
    dedupe?: boolean
    dedupeKey?: string
  }) => {
    return toast._showToast('loading', message, {
      dedupe: options?.dedupe,
      dedupeKey: options?.dedupeKey,
      style: {
        background: '#fffbeb',
        color: '#a16207',
        border: '1px solid #f59e0b',
        borderRadius: '12px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    })
  },

  info: (message: string, options?: { 
    duration?: number
    dedupe?: boolean
    dedupeKey?: string
  }) => {
    return toast._showToast('info', message, {
      duration: options?.duration || 4000,
      dedupe: options?.dedupe,
      dedupeKey: options?.dedupeKey,
      style: {
        background: '#f8fafc',
        color: '#475569',
        border: '1px solid #94a3b8',
        borderRadius: '12px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    })
  },

  promise: <T,>(
    promise: Promise<T>,
    {
      loading: loadingMessage,
      success: successMessage,
      error: errorMessage,
    }: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: Error | unknown) => string)
    }
  ) => {
    return hotToast.promise(promise, {
      loading: loadingMessage,
      success: successMessage,
      error: errorMessage,
    }, {
      style: {
        borderRadius: '12px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      success: {
        style: {
          background: '#f0f9ff',
          color: '#0c4a6e',
          border: '1px solid #0ea5e9',
        },
      },
      error: {
        style: {
          background: '#fef2f2',
          color: '#991b1b',
          border: '1px solid #ef4444',
        },
      },
      loading: {
        style: {
          background: '#fffbeb',
          color: '#a16207',
          border: '1px solid #f59e0b',
        },
      },
    })
  },

  // Custom auth-specific toasts
  auth: {
    signInStart: () => {
      return hotToast.loading('Connecting to Google...', {
        style: {
          background: '#f0f9ff',
          color: '#0c4a6e',
          border: '1px solid #0ea5e9',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
        },
      })
    },
    
    signInSuccess: (userName?: string) => {
      return hotToast.success(userName ? `Welcome back, ${userName}!` : 'Successfully signed in!', {
        duration: 3000,
        style: {
          background: '#f0f9ff',
          color: '#0c4a6e',
          border: '1px solid #0ea5e9',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
        },
      })
    },

    signInError: (error?: string) => {
      const message = error || 'Sign in failed. Please try again.'
      return hotToast.error(message, {
        duration: 6000,
        style: {
          background: '#fef2f2',
          color: '#991b1b',
          border: '1px solid #ef4444',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
        },
      })
    },

    signOutSuccess: () => {
      return hotToast.success('Successfully signed out', {
        duration: 2000,
        style: {
          background: '#f0f9ff',
          color: '#0c4a6e',
          border: '1px solid #0ea5e9',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
        },
      })
    },

    oauthNotConfigured: () => {
      return hotToast.error('OAuth setup incomplete. Please configure Google credentials.', {
        duration: 6000,
        style: {
          background: '#fef2f2',
          color: '#991b1b',
          border: '1px solid #ef4444',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
          maxWidth: '400px',
        },
      })
    },
  },

  // Account management toasts
  account: {
    deleteStart: () => {
      return hotToast.loading('Deleting account...', {
        style: {
          background: '#fef2f2',
          color: '#991b1b',
          border: '1px solid #ef4444',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
        },
      })
    },

    deleteSuccess: () => {
      return hotToast.success('Account deleted successfully. You will be redirected shortly.', {
        duration: 5000,
        style: {
          background: '#f0fdf4',
          color: '#166534',
          border: '1px solid #22c55e',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
        },
      })
    },

    deleteError: (error?: string) => {
      const message = error || 'Failed to delete account. Please try again.'
      return hotToast.error(message, {
        duration: 6000,
        style: {
          background: '#fef2f2',
          color: '#991b1b',
          border: '1px solid #ef4444',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
        },
      })
    },

    deleteCancelled: () => {
      return hotToast('Account deletion cancelled', {
        duration: 3000,
        style: {
          background: '#f8fafc',
          color: '#475569',
          border: '1px solid #94a3b8',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
        },
      })
    },

    deleteAdminBlocked: () => {
      return hotToast.error('Admin accounts cannot be deleted for security reasons.', {
        duration: 5000,
        style: {
          background: '#fef2f2',
          color: '#991b1b',
          border: '1px solid #ef4444',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
        },
      })
    }
  }
}
