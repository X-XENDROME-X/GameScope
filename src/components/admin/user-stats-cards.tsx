'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Shield, Settings, BarChart3 } from 'lucide-react'
import { useAdminData } from '@/hooks/use-admin-data'

export function UserStatsCards() {
  const { data, loading, error } = useAdminData()

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
              <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16 mb-1"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="col-span-full bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <p className="text-red-600 dark:text-red-400">Failed to load stats: {error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) {
    return null
  }

  // Calculate OAuth usage percentage (assuming 100 user limit)
  const oauthUsagePercent = Math.round((data.stats.totalUsers / 100) * 100)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Users */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Total Users
          </CardTitle>
          <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {data.stats.totalUsers}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Registered accounts
          </p>
        </CardContent>
      </Card>

      {/* Active Users */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Active Users
          </CardTitle>
          <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {data.stats.activeUsers}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Currently active
          </p>
        </CardContent>
      </Card>

      {/* Total Favorites */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Total Favorites
          </CardTitle>
          <BarChart3 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {data.stats.totalFavorites}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Games favorited
          </p>
        </CardContent>
      </Card>

      {/* OAuth Usage */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
            OAuth Usage
          </CardTitle>
          <Settings className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {oauthUsagePercent}%
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            of 100 user limit
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
