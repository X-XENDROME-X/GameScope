'use client'

import { useState, useEffect, useRef } from 'react'

export interface LoadingState {
  isLoading: boolean
  progress: number
  error: string | null
  stage: 'initializing' | 'fetching' | 'processing' | 'complete'
}

export function useLoadingState(initialLoading = false) {
  const [state, setState] = useState<LoadingState>({
    isLoading: initialLoading,
    progress: 0,
    error: null,
    stage: 'initializing'
  })

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Set loading with optional stage
  const setLoading = (isLoading: boolean, stage?: LoadingState['stage']) => {
    setState(prev => ({
      ...prev,
      isLoading,
      stage: stage || (isLoading ? 'fetching' : 'complete'),
      progress: isLoading ? 0 : 100,
      error: null
    }))
  }

  // Update progress (0-100)
  const setProgress = (progress: number, stage?: LoadingState['stage']) => {
    setState(prev => ({
      ...prev,
      progress: Math.max(0, Math.min(100, progress)),
      stage: stage || prev.stage
    }))
  }

  // Set error state
  const setError = (error: string | null) => {
    setState(prev => ({
      ...prev,
      error,
      isLoading: false,
      stage: error ? 'complete' : prev.stage
    }))
  }

  // Auto-increment progress with realistic timing
  const startAutoProgress = (duration = 2000) => {
    let progress = 0
    setState(prev => ({ ...prev, isLoading: true, stage: 'fetching', progress: 0 }))

    const increment = () => {
      progress += Math.random() * 15 + 5
      if (progress < 90) {
        setState(prev => ({ ...prev, progress: Math.min(progress, 90) }))
        timeoutRef.current = setTimeout(increment, duration / 20)
      } else {
        setState(prev => ({ ...prev, progress: 90, stage: 'processing' }))
      }
    }

    increment()
  }

  // Complete the loading process
  const complete = (delay = 200) => {
    setState(prev => ({ ...prev, progress: 100, stage: 'complete' }))
    
    timeoutRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, isLoading: false }))
    }, delay)
  }

  // Reset to initial state
  const reset = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setState({
      isLoading: false,
      progress: 0,
      error: null,
      stage: 'initializing'
    })
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    ...state,
    setLoading,
    setProgress,
    setError,
    startAutoProgress,
    complete,
    reset
  }
}

// Hook for component-specific loading states
export function useComponentLoading() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  const setComponentLoading = (componentId: string, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [componentId]: isLoading
    }))
  }

  const isComponentLoading = (componentId: string) => {
    return loadingStates[componentId] || false
  }

  const getLoadingComponents = () => {
    return Object.keys(loadingStates).filter(id => loadingStates[id])
  }

  return {
    loadingStates,
    setComponentLoading,
    isComponentLoading,
    getLoadingComponents,
    hasAnyLoading: Object.values(loadingStates).some(Boolean)
  }
}

// Hook for lazy loading with intersection observer
export function useLazyLoading(threshold = 0.1) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true)
          setHasLoaded(true)
        }
      },
      { threshold }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [threshold, hasLoaded])

  return {
    elementRef,
    isVisible,
    hasLoaded,
    shouldLoad: isVisible
  }
}
