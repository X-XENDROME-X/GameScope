'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { AlertTriangle, CheckCircle, Activity, Database, Users, Zap } from 'lucide-react'

interface UsageStats {
  timestamp: string
  database: {
    totalUsers: number
    activeUsers: number
    totalFavorites: number
    activeSessions: number
    databaseSize: string
  }
  limits: {
    vercelBandwidth: { used: string; limit: string; percentage: string }
    vercelFunctions: { used: number; limit: number; percentage: string }
    neonStorage: { used: string; limit: string; percentage: string }
    neonCompute: { used: string; limit: string; percentage: string }
    googleOAuth: { used: number; limit: string; percentage: string }
  }
  healthStatus: 'GREEN' | 'YELLOW' | 'RED'
  recommendations: string[]
}

export default function UsageDashboard() {
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchUsageStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/usage')
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - Admin access required')
        }
        throw new Error('Failed to fetch usage stats')
      }
      
      const data = await response.json()
      setStats(data)
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsageStats()
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchUsageStats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getPercentageColor = (percentage: string) => {
    const num = parseFloat(percentage.replace('%', ''))
    if (num >= 90) return 'text-red-600 dark:text-red-400'
    if (num >= 70) return 'text-orange-600 dark:text-orange-400'
    return 'text-green-600 dark:text-green-400'
  }

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 dark:border-red-800 bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Error Loading Usage Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button 
            onClick={fetchUsageStats}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    )
  }

  if (!stats) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'GREEN': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900'
      case 'YELLOW': return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900'
      case 'RED': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900'
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor free tier usage across all services
          </p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>
        <Badge className={getStatusColor(stats.healthStatus)}>
          {stats.healthStatus === 'GREEN' && <CheckCircle className="w-4 h-4 mr-1" />}
          {stats.healthStatus === 'YELLOW' && <AlertTriangle className="w-4 h-4 mr-1" />}
          {stats.healthStatus === 'RED' && <AlertTriangle className="w-4 h-4 mr-1" />}
          {stats.healthStatus}
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.database.totalUsers}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Registered users</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.database.activeUsers}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Currently active</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Favorites</CardTitle>
            <Database className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.database.totalFavorites}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total favorites</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">DB Size</CardTitle>
            <Zap className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.database.databaseSize}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Storage used</p>
          </CardContent>
        </Card>
      </div>

      {/* Service Limits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Vercel Limits</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">Hosting and function usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700 dark:text-gray-300">Bandwidth</span>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{stats.limits.vercelBandwidth.used} / {stats.limits.vercelBandwidth.limit}</div>
                <div className={`text-xs ${getPercentageColor(stats.limits.vercelBandwidth.percentage)}`}>
                  {stats.limits.vercelBandwidth.percentage}
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700 dark:text-gray-300">Function Executions</span>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{stats.limits.vercelFunctions.used} / {stats.limits.vercelFunctions.limit.toLocaleString()}</div>
                <div className={`text-xs ${getPercentageColor(stats.limits.vercelFunctions.percentage)}`}>
                  {stats.limits.vercelFunctions.percentage}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Neon Database Limits</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">Storage and compute usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700 dark:text-gray-300">Storage</span>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{stats.limits.neonStorage.used} / {stats.limits.neonStorage.limit}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{stats.limits.neonStorage.percentage}</div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700 dark:text-gray-300">Compute Hours</span>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{stats.limits.neonCompute.used}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">/ {stats.limits.neonCompute.limit}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Google OAuth</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">Authentication usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700 dark:text-gray-300">Daily Sign-ins</span>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{stats.limits.googleOAuth.used} users</div>
                <div className="text-xs text-green-600 dark:text-green-400">Well under {stats.limits.googleOAuth.limit}</div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700 dark:text-gray-300">Status</span>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {stats.limits.googleOAuth.percentage}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Usage rate</div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700 dark:text-gray-300">App Type</span>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {parseInt(stats.limits.googleOAuth.limit) === 100 ? 'Unverified' : 'Verified'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">OAuth status</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      {stats.recommendations.length > 0 && (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Recommendations</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">Suggestions to optimize usage</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {stats.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
        <span>Real-time usage monitoring</span>
        <button 
          onClick={fetchUsageStats}
          disabled={loading}
          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-300 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    </div>
  )
}
