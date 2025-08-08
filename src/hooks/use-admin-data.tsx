'use client'

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react'

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  createdAt: string
  favoritesCount: number | null
  isActive: boolean
}

interface UserStats {
  totalUsers: number
  activeUsers: number
  totalFavorites: number
}

interface AdminData {
  users: User[]
  stats: UserStats
}

interface AdminDataContextType {
  data: AdminData | null
  loading: boolean
  error: string | null
  refreshData: () => Promise<void>
  deleteUser: (userId: string, userEmail: string) => Promise<void>
  deletingUser: string | null
}

const AdminDataContext = createContext<AdminDataContextType | null>(null)

export function useAdminData() {
  const context = useContext(AdminDataContext)
  if (!context) {
    throw new Error('useAdminData must be used within AdminDataProvider')
  }
  return context
}

interface AdminDataProviderProps {
  children: ReactNode
}

export function AdminDataProvider({ children }: AdminDataProviderProps) {
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingUser, setDeletingUser] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users')
      
      if (!response.ok) {
        throw new Error('Failed to fetch admin data')
      }
      
      const userData = await response.json()
      setData(userData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteUser = useCallback(async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete user: ${userEmail}?\n\nThis action cannot be undone and will remove all their data including favorites.`)) {
      return
    }

    try {
      setDeletingUser(userId)
      const response = await fetch(`/api/admin/users?userId=${encodeURIComponent(userId)}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete user')
      }

      // Refresh all admin data after deletion
      await fetchData()
      
      // Show success message
      console.log('User deleted successfully')
    } catch (err) {
      console.error('Failed to delete user:', err)
      alert('Failed to delete user: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setDeletingUser(null)
    }
  }, [fetchData])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const value = {
    data,
    loading,
    error,
    refreshData: fetchData,
    deleteUser,
    deletingUser
  }

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  )
}
