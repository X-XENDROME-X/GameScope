import { useState, useEffect, useCallback } from 'react'

interface UseDebounceSearchOptions {
  delay?: number
  minLength?: number
  maxLength?: number
}

interface UseDebounceSearchReturn {
  debouncedValue: string
  isSearching: boolean
  immediateValue: string
  setImmediateValue: (value: string) => void
  clearSearch: () => void
}

/**
 * Custom hook for debounced search functionality
 * Provides intelligent search delay and validation
 */
export function useDebounceSearch(
  initialValue: string = '',
  options: UseDebounceSearchOptions = {}
): UseDebounceSearchReturn {
  const {
    delay = 300, // 300ms delay - good balance between responsiveness and API calls
    minLength = 1, // Minimum characters before search
    maxLength = 100 // Maximum search length
  } = options

  const [immediateValue, setImmediateValue] = useState(initialValue)
  const [debouncedValue, setDebouncedValue] = useState(initialValue)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    // Don't debounce if the value is too short or empty
    if (immediateValue.length < minLength) {
      setDebouncedValue('')
      setIsSearching(false)
      return
    }

    // Trim and validate the search value
    const trimmedValue = immediateValue.trim().substring(0, maxLength)
    
    // Set searching state immediately when user types
    setIsSearching(true)

    // Set up the debounce timer
    const timeoutId = setTimeout(() => {
      setDebouncedValue(trimmedValue)
      setIsSearching(false)
    }, delay)

    // Cleanup function
    return () => {
      clearTimeout(timeoutId)
    }
  }, [immediateValue, delay, minLength, maxLength])

  // Clear search function
  const clearSearch = useCallback(() => {
    setImmediateValue('')
    setDebouncedValue('')
    setIsSearching(false)
  }, [])

  return {
    debouncedValue,
    isSearching,
    immediateValue,
    setImmediateValue,
    clearSearch
  }
}

/**
 * Hook specifically for game search with predefined optimal settings
 */
export function useGameSearch(initialValue: string = '') {
  return useDebounceSearch(initialValue, {
    delay: 400, // Slightly longer delay for game search
    minLength: 2, // At least 2 characters for meaningful game search
    maxLength: 80 // Reasonable limit for game titles
  })
}
