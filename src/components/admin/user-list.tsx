'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Trash2, Shield, AlertTriangle } from 'lucide-react'
import Image from 'next/image'
import { useAdminData } from '@/hooks/use-admin-data'

interface UserListProps {
  currentAdminEmail?: string
}

export function UserList({ currentAdminEmail }: UserListProps) {
  const { data, loading, error, deleteUser, deletingUser, refreshData } = useAdminData()
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  
  // Calculate OAuth usage percentage for the progress bar
  const oauthUsagePercent = useMemo(() => {
    if (!data) return 0
    return Math.min((data.stats.totalUsers / 100) * 100, 100)
  }, [data])

  const handleImageError = (userId: string) => {
    setImageErrors(prev => new Set(prev).add(userId))
  }

  if (loading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            Registered Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
                  <div className="h-3 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Error Loading Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.users.length === 0) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            Registered Users
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            User management will be available once users start registering
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Users Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Once users start signing up with Google OAuth, they'll appear here. 
              You'll be able to manage their accounts and monitor usage.
            </p>
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                💡 <strong>Tip:</strong> Share your app to get your first users! 
                The free tier supports up to 100 users.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              Registered Users ({data.users.length})
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Manage user accounts and monitor OAuth usage
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <div className="w-3 h-3 animate-spin rounded-full border border-current border-t-transparent" />
            ) : (
              <Shield className="w-3 h-3" />
            )}
            Refresh
          </Button>
        </div>
        
        {/* OAuth Warning */}
        {data.stats.totalUsers > 80 && (
          <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <p className="text-sm text-orange-800 dark:text-orange-300">
                <strong>Warning:</strong> Approaching OAuth user limit ({data.stats.totalUsers}/100). 
                Consider monitoring new registrations closely.
              </p>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {data.users.map((user) => (
            <div 
              key={user.id} 
              className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {user.image && !imageErrors.has(user.id) ? (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                    <Image
                      src={user.image}
                      alt={user.name || 'User'}
                      width={40}
                      height={40}
                      className="object-cover"
                      unoptimized
                      onError={() => handleImageError(user.id)}
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {user.name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                  </div>
                )}
                
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {user.name || 'Anonymous User'}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                    <span>Favorites: {user.favoritesCount || 0}</span>
                    {user.isActive && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400">
                        Active
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* User Status Indicator */}
                <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                
                {/* Admin Controls */}
                <div className="flex gap-1">
                  {/* Delete User Button - Only show if not current admin */}
                  {user.email !== currentAdminEmail && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteUser(user.id, user.email)}
                      disabled={deletingUser === user.id}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                      title="Delete User Account"
                    >
                      {deletingUser === user.id ? (
                        <div className="w-3 h-3 animate-spin rounded-full border border-current border-t-transparent" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                    </Button>
                  )}
                  {/* Show Admin indicator for current admin */}
                  {user.email === currentAdminEmail && (
                    <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300 group cursor-pointer">
                      <Shield className="w-3 h-3 transition-all duration-300 group-hover:fill-purple-600 dark:group-hover:fill-purple-400" />
                      Admin
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {data.users.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {data.stats.totalUsers}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Total Users</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {data.stats.activeUsers}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Active Now</div>
              </div>
            </div>
            
            <div className="mt-3 text-center">
              <div className="text-xs text-gray-600 dark:text-gray-400">
                OAuth Usage: {Math.round((data.stats.totalUsers / 100) * 100)}% of 100 user limit
              </div>
              <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div 
                  className={`bg-blue-600 h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${oauthUsagePercent}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
