export function GameCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden animate-pulse border border-gray-200 dark:border-gray-700">
      <div className="h-48 bg-gray-300 dark:bg-gray-600" />
      <div className="p-4">
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-2" />
        <div className="flex items-center mb-2">
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
            ))}
          </div>
          <div className="ml-2 w-12 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
        </div>
        <div className="space-y-2 mb-3">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded" />
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
        </div>
        <div className="flex gap-1 mb-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-6 w-16 bg-gray-300 dark:bg-gray-600 rounded" />
          ))}
        </div>
        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
            ))}
          </div>
          <div className="w-16 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
        </div>
      </div>
    </div>
  )
}
