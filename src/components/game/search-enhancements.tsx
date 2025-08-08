import React from 'react'

interface SearchHighlightProps {
  text: string
  query: string
  className?: string
}

/**
 * Component to highlight search terms in text
 */
export function SearchHighlight({ text, query, className = '' }: SearchHighlightProps) {
  if (!query || !text) {
    return <span className={className}>{text}</span>
  }

  // Split query into individual words for highlighting
  const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 0)
  
  if (queryWords.length === 0) {
    return <span className={className}>{text}</span>
  }

  // Create a regex to match any of the query words (case insensitive)
  const regex = new RegExp(`(${queryWords.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
  
  // Split the text by the regex, keeping the matched parts
  const parts = text.split(regex)

  return (
    <span className={className}>
      {parts.map((part, index) => {
        // Check if this part matches any of our query words
        const isMatch = queryWords.some(word => 
          part.toLowerCase() === word.toLowerCase()
        )
        
        return isMatch ? (
          <mark 
            key={index}
            className="bg-yellow-200 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100 px-1 rounded font-medium"
          >
            {part}
          </mark>
        ) : (
          part
        )
      })}
    </span>
  )
}

interface SearchStatsProps {
  totalResults: number
  currentPage: number
  pageSize: number
  searchQuery: string
  searchTime?: number
}

/**
 * Component to display search statistics and context
 */
export function SearchStats({ 
  totalResults, 
  currentPage, 
  pageSize, 
  searchQuery,
  searchTime 
}: SearchStatsProps) {
  const startResult = ((currentPage - 1) * pageSize) + 1
  const endResult = Math.min(currentPage * pageSize, totalResults)

  if (!searchQuery) return null

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {totalResults > 0 ? (
          <>
            Showing <span className="font-medium text-gray-900 dark:text-gray-100">{startResult}-{endResult}</span> of{' '}
            <span className="font-medium text-gray-900 dark:text-gray-100">{totalResults.toLocaleString()}</span> results for{' '}
            <span className="font-medium text-blue-600 dark:text-blue-400">"{searchQuery}"</span>
          </>
        ) : (
          <>
            No results found for{' '}
            <span className="font-medium text-blue-600 dark:text-blue-400">"{searchQuery}"</span>
          </>
        )}
      </div>
      
      {searchTime && searchTime > 0 && (
        <div className="text-xs text-gray-500 dark:text-gray-500">
          Search completed in {searchTime.toFixed(2)}s
        </div>
      )}
    </div>
  )
}

interface NoSearchResultsProps {
  searchQuery: string
  onClearSearch?: () => void
  suggestions?: string[]
}

/**
 * Component to display when no search results are found
 */
export function NoSearchResults({ 
  searchQuery, 
  onClearSearch,
  suggestions = []
}: NoSearchResultsProps) {
  const defaultSuggestions = [
    'Try searching for popular games like "Cyberpunk", "Witcher", or "GTA"',
    'Use shorter, more general terms',
    'Check your spelling',
    'Try searching by genre like "RPG" or "Action"'
  ]

  const displaySuggestions = suggestions.length > 0 ? suggestions : defaultSuggestions

  return (
    <div className="text-center py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <svg 
            className="mx-auto h-12 w-12 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No games found
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We couldn't find any games matching "{searchQuery}". Here are some suggestions:
        </p>
        
        <ul className="text-left space-y-2 mb-6">
          {displaySuggestions.map((suggestion, index) => (
            <li key={index} className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{suggestion}</span>
            </li>
          ))}
        </ul>
        
        {onClearSearch && (
          <button
            onClick={onClearSearch}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 transition-colors"
          >
            Clear search and browse all games
          </button>
        )}
      </div>
    </div>
  )
}
