'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { AdminHeader } from '@/components/admin/admin-header'
import { AdminPageWrapper } from '@/components/admin/admin-page-wrapper'
import { AdminDataProvider } from '@/hooks/use-admin-data'
import UsageDashboard from '@/components/admin/usage-dashboard'
import { UserList } from '@/components/admin/user-list'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Shield, Users, BarChart3, Settings, Activity, Database, CheckCircle, Zap, AlertTriangle, Home } from 'lucide-react'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [adminCheckLoading, setAdminCheckLoading] = useState(true)
  const [isNavigatingHome, setIsNavigatingHome] = useState(false)
  
  // Handle navigation to home
  const handleNavigateHome = () => {
    setIsNavigatingHome(true)
    router.push('/')
  }

  // Check admin status using API route
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (status === 'loading') return
      
      if (!session?.user?.email) {
        setIsAdmin(false)
        setAdminCheckLoading(false)
        return
      }

      try {
        const response = await fetch('/api/admin/check')
        const data = await response.json()
        setIsAdmin(data.isAdmin)
        // Admin check completed successfully
      } catch (error) {
        console.error('Failed to check admin status:', error)
        setIsAdmin(false)
      } finally {
        setAdminCheckLoading(false)
      }
    }

    checkAdminStatus()
  }, [session, status])
  
  // Loading state
  if (status === 'loading' || adminCheckLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    )
  }
  
  // Check authentication and admin access
  if (!session?.user?.email) {
    router.push('/auth/signin?callbackUrl=/admin')
    return null
  }
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-6">
            <Shield className="w-20 h-20 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Access Denied
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You are not authorized to access this page. Only administrators can view the admin dashboard.
            </p>
            {session?.user?.email && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 mb-6">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  <strong>Current Account:</strong> {session.user.email}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={handleNavigateHome}
            disabled={isNavigatingHome}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors mx-auto"
          >
            {isNavigatingHome ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Home className="h-5 w-5" />
            )}
            {isNavigatingHome ? 'Loading...' : 'Go to Home'}
          </button>
        </div>
      </div>
    )
  }  return (
    <AdminPageWrapper>
      <AdminDataProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <AdminHeader />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Enhanced Admin Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-6 sm:p-8 text-white shadow-2xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Shield className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  Admin Dashboard
                </h1>
                <p className="text-blue-100 text-sm sm:text-base max-w-2xl">
                  Monitor and manage your GameScope platform with comprehensive analytics and user management tools
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <p className="text-xs sm:text-sm text-blue-100 mb-1">Logged in as</p>
                <p className="font-semibold text-sm sm:text-base">{session.user.name}</p>
                <p className="text-xs text-blue-200 truncate max-w-48">{session.user.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation Cards */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Navigation</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button 
              onClick={() => document.getElementById('usage-analytics')?.scrollIntoView({ behavior: 'smooth' })}
              className="group text-left w-full"
            >
              <Card className="h-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                      <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        Usage Analytics
                      </CardTitle>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Monitor service usage and limits
                      </p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </button>
            
            <button 
              onClick={() => document.getElementById('user-management')?.scrollIntoView({ behavior: 'smooth' })}
              className="group text-left w-full"
            >
              <Card className="h-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-800/50 transition-colors">
                      <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        User Management
                      </CardTitle>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Manage users and OAuth limits
                      </p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </button>
            
            <button 
              onClick={() => document.getElementById('tier-guidelines')?.scrollIntoView({ behavior: 'smooth' })}
              className="group text-left w-full"
            >
              <Card className="h-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-colors">
                      <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        Free Tier Monitor
                      </CardTitle>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Track limits and guidelines
                      </p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8 lg:space-y-12">
          {/* Usage Dashboard Section */}
          <section id="usage-analytics" className="scroll-mt-24">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                      Service Usage & Limits
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
                      Real-time monitoring dashboard for service limits
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Activity className="w-4 h-4" />
                  <span>Real-time monitoring</span>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Usage Dashboard
                </h3>
                <UsageDashboard />
              </div>
            </div>
          </section>

          {/* User Management Section */}
          <section id="user-management" className="scroll-mt-24">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                      User Management
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
                      Manage registered users and OAuth limits (max 100 users for free tier)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-full text-sm text-green-700 dark:text-green-300">
                  <CheckCircle className="w-4 h-4" />
                  <span>Active Management</span>
                </div>
              </div>
              
              <div className="space-y-8">
                {/* User Management Interface */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                    User Directory
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                    Comprehensive list of all registered users with management options
                  </p>
                  <UserList currentAdminEmail={session.user.email} />
                </div>
              </div>
            </div>
          </section>

          {/* Free Tier Guidelines */}
          <section id="tier-guidelines" className="scroll-mt-24">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <Settings className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                      Free Tier Guidelines
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
                      Key limits to monitor for cost-free operation
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-full text-sm text-purple-700 dark:text-purple-300">
                  <Zap className="w-4 h-4" />
                  <span>Cost Optimization</span>
                </div>
              </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white dark:bg-gray-800 border-green-200 dark:border-green-700 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-green-700 dark:text-green-400 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    ✅ Safe Operating Limits
                  </CardTitle>
                  <CardDescription className="text-green-600 dark:text-green-400">
                    Current limits within free tier boundaries
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Google OAuth Users</span>
                      <span className="text-sm font-bold text-green-700 dark:text-green-400">100 users max (Free)</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Vercel Bandwidth</span>
                      <span className="text-sm font-bold text-green-700 dark:text-green-400">100GB/month</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Vercel Functions</span>
                      <span className="text-sm font-bold text-green-700 dark:text-green-400">100K executions/month</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Neon Storage</span>
                      <span className="text-sm font-bold text-green-700 dark:text-green-400">0.5GB total</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-orange-200 dark:border-orange-700 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-orange-700 dark:text-orange-400 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    ⚠️ Critical Monitoring Points
                  </CardTitle>
                  <CardDescription className="text-orange-600 dark:text-orange-400">
                    Areas requiring constant vigilance to avoid costs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-400">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Users</span>
                      <span className="text-sm font-bold text-red-600 dark:text-red-400">Keep under 100 (Critical!)</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-l-4 border-orange-400">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">DB Compute Time</span>
                      <span className="text-sm font-bold text-orange-600 dark:text-orange-400">191.9h/month limit</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-400">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Bandwidth Usage</span>
                      <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">Monitor page views closely</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-purple-400">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">API Requests</span>
                      <span className="text-sm font-bold text-purple-600 dark:text-purple-400">Track function calls</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            </div>
          </section>
        </div>
        
        {/* Scroll to Top Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-white/20"
            title="Scroll to top"
            size="sm"
          >
            <Shield className="w-5 h-5" />
          </Button>
        </div>
      </main>
    </div>
      </AdminDataProvider>
    </AdminPageWrapper>
  )
}
