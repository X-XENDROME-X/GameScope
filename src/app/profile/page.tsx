'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState, useMemo, useRef } from 'react'
import { User, Star, TrendingUp, Calendar, Home, Trash2, AlertTriangle, Heart, Download } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useFavorites } from '@/hooks/use-favorites'
import { DeleteAccountModal } from '@/components/ui/delete-account-modal'
import { toast } from '@/lib/toast'
import { signOut } from 'next-auth/react'
import html2canvas from 'html2canvas'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const { favorites, getRealTimeCount, loading } = useFavorites()
  const router = useRouter()
  const currentCount = getRealTimeCount()
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [isNavigatingHome, setIsNavigatingHome] = useState<boolean>(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)
  const [isScreenshotting, setIsScreenshotting] = useState<boolean>(false)

  const [profileImageError, setProfileImageError] = useState(false)
  const favoritesStatsRef = useRef<HTMLDivElement>(null)

  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!session?.user?.email) return
      
      try {
        const response = await fetch('/api/admin/check')
        const data = await response.json()
        setIsAdmin(data.isAdmin)
      } catch (error) {
        console.error('Failed to check admin status:', error)
        setIsAdmin(false)
      }
    }

    if (session?.user?.email) {
      checkAdminStatus()
    }
  }, [session])

  // Delete account function with enhanced UX
  const handleDeleteAccount = async () => {
    if (isAdmin) {
      toast.account.deleteAdminBlocked()
      return
    }

    setIsDeleting(true)
    const loadingToast = toast.account.deleteStart()
    
    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account')
      }

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast)
      toast.account.deleteSuccess()

      // Close modal
      setIsDeleteModalOpen(false)

      // Sign out and redirect after a short delay
      setTimeout(async () => {
        await signOut({ callbackUrl: '/' })
      }, 2000)

    } catch (error) {
      toast.dismiss(loadingToast)
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete account'
      toast.account.deleteError(errorMessage)
      console.error('Account deletion error:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle delete modal
  const handleDeleteModalClose = () => {
    if (!isDeleting) {
      setIsDeleteModalOpen(false)
      toast.account.deleteCancelled()
    }
  }

  // Screenshot favorites stats function (renders a CSS-isolated export card to avoid OKLCH parsing)
  const handleScreenshotFavorites = async () => {
    setIsScreenshotting(true)
    try {
      // Theme-aware palette with RGB/HEX only (no OKLCH)
      const isDark = document.documentElement.classList.contains('dark')
      const palette = isDark
        ? {
            bg: 'linear-gradient(135deg, #1f2937, #374151)',
            border: '#374151',
            text: '#e5e7eb',
            subtext: '#9ca3af',
            statBlue: '#60a5fa',
            statGreen: '#34d399',
            statPurple: '#c084fc',
            chipBg1: '#1e3a8a',
            chipText1: '#c7d2fe',
            chipBg2: '#581c87',
            chipText2: '#e9d5ff',
            chipBg3: '#064e3b',
            chipText3: '#bbf7d0',
          }
        : {
            bg: 'linear-gradient(135deg, #f0f9ff, #f3e8ff)',
            border: '#dbeafe',
            text: '#111827',
            subtext: '#4b5563',
            statBlue: '#2563eb',
            statGreen: '#16a34a',
            statPurple: '#9333ea',
            chipBg1: '#dbeafe',
            chipText1: '#1e40af',
            chipBg2: '#e9d5ff',
            chipText2: '#581c87',
            chipBg3: '#dcfce7',
            chipText3: '#065f46',
          }

      // Helper to create elements with inline styles
      const el = (tag: keyof HTMLElementTagNameMap, styles: Partial<CSSStyleDeclaration>, text?: string) => {
        const node = document.createElement(tag)
        Object.assign(node.style, styles)
        if (text) node.textContent = text
        return node
      }

      // Preload images with CORS; fallback to null on failure
      type FavItem = { id: string; gameName: string; gameRating?: string | null; gameGenres?: string | null; addedAt: string; gameImage?: string | null }
      const favItems: FavItem[] = (favorites ?? []) as FavItem[]
      const imageMap = new Map<string, HTMLImageElement | null>()
      const loadImage = (id: string, url?: string | null) => new Promise<void>((resolve) => {
        if (!url) { imageMap.set(id, null); return resolve() }
        const img = document.createElement('img') as HTMLImageElement
        img.crossOrigin = 'anonymous'
        img.onload = () => { imageMap.set(id, img); resolve() }
        img.onerror = () => { imageMap.set(id, null); resolve() }
        img.src = url
      })
  const toProxy = (url?: string | null) => (url ? `/api/image-proxy?url=${encodeURIComponent(url)}` : undefined)
  await Promise.all(favItems.map(f => loadImage(f.id, toProxy(f.gameImage))))

      // Offscreen export card container
      const container = el('div', {
        position: 'fixed',
        left: '-10000px',
        top: '0px',
        width: '920px',
        padding: '24px',
        background: `${palette.bg}, repeating-linear-gradient(135deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 6px, rgba(0,0,0,0.02) 6px, rgba(0,0,0,0.02) 12px)`,
        color: palette.text,
        border: `1px solid ${palette.border}`,
        borderRadius: '16px',
        boxShadow: isDark ? '0 12px 28px rgba(0,0,0,0.40)' : '0 12px 28px rgba(0,0,0,0.12)',
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, Noto Sans, \'Apple Color Emoji\', \'Segoe UI Emoji\'',
      })

      // Header: Title + count badge (no background)
      const header = el('div', { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' })
      const title = el('div', { fontSize: '20px', fontWeight: '800', letterSpacing: '-0.01em' }, 'My Favorites')
      const countBadge = el('div', {
        fontSize: '14px',
        fontWeight: '600',
        color: isDark ? '#94a3b8' : '#6b7280',
        letterSpacing: '0.01em',
      }, `${currentCount}/20`)
      header.appendChild(title)
      header.appendChild(countBadge)

      // Stats row
  const row = el('div', { display: 'flex', gap: '28px', alignItems: 'center', marginTop: '8px' })

      const stat = (value: string, label: string, color: string) => {
        const wrap = el('div', { textAlign: 'center', minWidth: '110px' })
  wrap.appendChild(el('div', { fontSize: '32px', fontWeight: '900', color, letterSpacing: '-0.02em' }, value))
  wrap.appendChild(el('div', { fontSize: '12px', color: palette.subtext, marginTop: '2px' }, label))
        return wrap
      }

  row.appendChild(stat(String(currentCount), 'Favorites', palette.statBlue))
  // Use computed stats safely
  const totalGenresVal: number = (userStats?.totalGenres ?? 0) as number
  const avgRatingVal: string = (userStats?.averageRating ?? 0).toFixed(1)

  row.appendChild(stat(String(totalGenresVal), 'Genres', palette.statGreen))
  row.appendChild(stat(String(avgRatingVal), 'Avg Rating', palette.statPurple))

  // Optional: Top genres title + chips
  const chipsSection = el('div', { marginTop: '16px' })
  const chipsTitle = el('div', { fontSize: '14px', fontWeight: '800', marginBottom: '8px', color: palette.text }, 'Your Top Genres')
  const chipsWrap = el('div', { display: 'flex', flexWrap: 'wrap', gap: '8px' })
  const topGenresArr: Array<{ genre: string; count?: number }> = (userStats?.topGenres ?? []) as Array<{ genre: string; count?: number }>
  topGenresArr.slice(0, 3).forEach((g: { genre: string; count?: number }, idx: number) => {
    const colors = ['#3b82f6', '#8b5cf6', '#10b981'] // Blue, Purple, Green
    const genreText = el('span', { 
      fontSize: '13px', 
      fontWeight: '800', 
      color: colors[idx] || colors[0],
      textShadow: isDark ? '0 0 8px rgba(255,255,255,0.2)' : '0 0 8px rgba(0,0,0,0.1)',
      marginRight: '12px',
      display: 'inline-block'
    }, `• ${g.genre ?? String(g)}`)
    chipsWrap.appendChild(genreText)
  })
  chipsSection.appendChild(chipsTitle)
  chipsSection.appendChild(chipsWrap)

      // Assemble
      container.appendChild(header)
      container.appendChild(row)
      if (topGenresArr.length) container.appendChild(chipsSection)

      // Latest addition
    if (userStats?.latestGame?.gameName && userStats?.latestGame?.addedAt) {
        const latest = el('div', {
          marginTop: '16px',
          padding: '12px',
          borderRadius: '12px',
          background: isDark ? 'rgba(15,23,42,0.35)' : '#f8fafc',
          color: palette.subtext,
          fontSize: '13px',
          border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        })
        // thumbnail
  const lgName = userStats.latestGame?.gameName || ''
  const latestFav = favItems.find(f => f.gameName === lgName)
  const thumb = el('div', { width: '48px', height: '48px', borderRadius: '10px', overflow: 'hidden', background: isDark ? '#1f2937' : '#e5e7eb', flexShrink: '0', boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.35)' : '0 2px 8px rgba(0,0,0,0.1)' })
        const lm = latestFav ? imageMap.get(latestFav.id) : null
        if (lm) {
          lm.style.width = '100%'; lm.style.height = '100%'; lm.style.objectFit = 'cover'
          thumb.appendChild(lm.cloneNode(true))
        }
        const latestText = el('div', { display: 'flex', flexDirection: 'column', flex: '1', minWidth: '0' })
        const lbl = el('div', { fontSize: '11px', color: palette.subtext, textTransform: 'uppercase', letterSpacing: '0.08em' }, 'Latest addition')
  const dateStr = new Date(userStats.latestGame.addedAt).toLocaleDateString()
  const name = el('div', { 
    fontSize: '14px', 
    fontWeight: '800', 
    color: palette.text, 
    lineHeight: '1.3',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    whiteSpace: 'normal'
  }, `${userStats.latestGame.gameName}`)
  const dateLine = el('div', { fontSize: '12px', color: palette.subtext }, dateStr)
        latestText.appendChild(lbl)
        latestText.appendChild(name)
  latestText.appendChild(dateLine)
        latest.appendChild(thumb)
        latest.appendChild(latestText)
        container.appendChild(latest)
      }

      // Divider
      const divider = el('div', { height: '1px', background: isDark ? '#374151' : '#e5e7eb', marginTop: '14px', marginBottom: '10px' })
      container.appendChild(divider)

      // Favorites list with fixed 20 slots (10 rows x 2 columns) for consistent layout
      const listWrap = el('div', {
        display: 'grid',
        gap: '12px',
        gridTemplateColumns: '1fr 1fr', // Always 2 columns
      })

      // Create exactly 20 slots - fill with favorites first, then empty placeholders
      for (let i = 0; i < 20; i++) {
        const f = favItems[i] // Will be undefined for slots beyond actual favorites
        const isEmpty = !f

        const item = el('div', {
          padding: '12px',
          borderRadius: '12px',
          background: isEmpty 
            ? (isDark ? 'rgba(15,23,42,0.25)' : 'rgba(248,250,252,0.8)')
            : (isDark ? '#0b1220' : '#ffffff'),
          border: isEmpty
            ? `1px dashed ${isDark ? '#374151' : '#d1d5db'}`
            : `1px solid ${isDark ? '#1f2937' : '#e5e7eb'}`,
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          opacity: isEmpty ? '0.6' : '1',
        })

        // Image or placeholder
        const thumbWrap = el('div', {
          width: '56px',
          height: '56px',
          borderRadius: '10px',
          overflow: 'hidden',
          background: isEmpty
            ? (isDark ? '#1f2937' : '#e5e7eb')
            : (isDark ? '#111827' : '#f3f4f6'),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: '0',
        })

        if (!isEmpty) {
          // Real favorite game
          const loaded = imageMap.get(f.id)
          if (loaded) {
            loaded.style.width = '100%'
            loaded.style.height = '100%'
            loaded.style.objectFit = 'cover'
            thumbWrap.appendChild(loaded.cloneNode(true))
          } else {
            // Placeholder with initial for real games
            const initial = (f.gameName || '?').trim().charAt(0).toUpperCase()
            const ph = el('div', { fontSize: '18px', fontWeight: '800', color: isDark ? '#9ca3af' : '#6b7280' }, initial)
            thumbWrap.appendChild(ph)
          }
        } else {
          // Empty slot placeholder
          const emptyIcon = el('div', { 
            fontSize: '24px', 
            color: isDark ? '#4b5563' : '#9ca3af',
            fontWeight: '300'
          }, '•')
          thumbWrap.appendChild(emptyIcon)
        }

        // Content
        const content = el('div', { display: 'flex', flexDirection: 'column', gap: '3px', minWidth: '0', flex: '1' })
        
        if (!isEmpty) {
          // Real favorite content
          const titleRow = el('div', { 
            fontSize: '14px', 
            fontWeight: '700', 
            color: palette.text, 
            lineHeight: '1.3',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            whiteSpace: 'normal'
          }, f.gameName)
          content.appendChild(titleRow)
          
          if (f.gameRating) {
            content.appendChild(el('div', { fontSize: '12px', color: palette.subtext }, `Rating: ${f.gameRating}/5`))
          }
          if (f.gameGenres) {
            content.appendChild(el('div', { 
              fontSize: '12px', 
              color: palette.subtext,
              lineHeight: '1.4',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }, String(f.gameGenres)))
          }
          content.appendChild(el('div', { fontSize: '11px', color: palette.subtext, marginTop: '2px' }, `Added ${new Date(f.addedAt).toLocaleDateString()}`))
        } else {
          // Empty slot content
          const emptyTitle = el('div', { 
            fontSize: '14px', 
            fontWeight: '500', 
            color: isDark ? '#6b7280' : '#9ca3af',
            fontStyle: 'italic'
          }, '— Empty slot —')
          content.appendChild(emptyTitle)
          
          const emptySubtext = el('div', { 
            fontSize: '12px', 
            color: isDark ? '#4b5563' : '#9ca3af'
          }, 'Add more favorites')
          content.appendChild(emptySubtext)
        }

        item.appendChild(thumbWrap)
        item.appendChild(content)
        listWrap.appendChild(item)
      }
      
      container.appendChild(listWrap)
      document.body.appendChild(container)

      // Render export card only (no external CSS parsing)
      const canvas = await html2canvas(container, {
        backgroundColor: null,
        scale: 3,
        useCORS: true,
        logging: false,
      })

      // Cleanup export node
      container.remove()

      // Create download link
      const link = document.createElement('a')
      link.download = `GameScope-Stats-${session?.user?.name?.replace(/\s+/g, '-') || 'User'}-${new Date().toISOString().split('T')[0]}.png`
      link.href = canvas.toDataURL('image/png', 1.0)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success('Stats card exported successfully! 🎮')
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Failed to export stats card. Please try again.')
    } finally {
      setIsScreenshotting(false)
    }
  }

  // Navigate to home function
  const handleNavigateHome = () => {
    setIsNavigatingHome(true)
    router.push('/')
  }

  // Calculate user statistics and insights
  const userStats = useMemo(() => {
    if (!favorites.length) return null

    // Analyze favorite genres
    const genreCount: Record<string, number> = {}
    favorites.forEach(fav => {
      if (fav.gameGenres) {
        const genres = fav.gameGenres.split(', ')
        genres.forEach(genre => {
          genreCount[genre] = (genreCount[genre] || 0) + 1
        })
      }
    })

    // Get top 3 genres
    const topGenres = Object.entries(genreCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([genre, count]) => ({ genre, count }))

    // Calculate average rating
    const ratingsWithValues = favorites
      .filter(fav => fav.gameRating)
      .map(fav => parseFloat(fav.gameRating!))
    
    const averageRating = ratingsWithValues.length > 0 
      ? ratingsWithValues.reduce((sum, rating) => sum + rating, 0) / ratingsWithValues.length
      : 0

    // Find most recent addition
    const sortedByDate = [...favorites].sort((a, b) => 
      new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
    )
    const latestGame = sortedByDate[0]

    return {
      topGenres,
      averageRating,
      latestGame,
      totalGenres: Object.keys(genreCount).length
    }
  }, [favorites])

  // Calculate account age (approximate since we don't have exact creation date)
  const accountInfo = useMemo(() => {
    if (!favorites.length) return null
    
    // Use the oldest favorite as a proxy for account activity
    const oldestFavorite = favorites.reduce((oldest, current) => 
      new Date(current.addedAt) < new Date(oldest.addedAt) ? current : oldest
    )
    
    const firstActivity = new Date(oldestFavorite.addedAt)
    const now = new Date()
    const daysSinceFirstActivity = Math.floor((now.getTime() - firstActivity.getTime()) / (1000 * 60 * 60 * 24))
    
    return {
      firstActivity,
      daysSinceFirstActivity
    }
  }, [favorites])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Sign in Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please sign in to view your profile and manage your favorites.
          </p>
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
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Enhanced Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* User Info */}
            <div className="flex items-center space-x-4">
              {session.user?.image && !profileImageError ? (
                <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 ring-4 ring-blue-100 dark:ring-blue-900">
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover"
                    unoptimized
                    onError={() => setProfileImageError(true)}
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-semibold ring-4 ring-blue-100 dark:ring-blue-900">
                  {session.user?.name?.charAt(0)?.toUpperCase() || session.user?.email?.charAt(0)?.toUpperCase() || <User className="w-8 h-8" />}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {session.user?.name || 'Gaming Enthusiast'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {session.user?.email}
                </p>
                {accountInfo && (
                  <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4 mr-1" />
                    Active since {accountInfo.firstActivity.toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>

            {/* Navigation and Quick Stats */}
            <div className="flex flex-col items-end gap-4">
              {/* Home Button */}
              <button
                onClick={handleNavigateHome}
                disabled={isNavigatingHome}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
              >
                {isNavigatingHome ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Home className="h-4 w-4" />
                )}
                Home
              </button>

              {/* Quick Stats - This section will be captured for screenshot */}
              <div 
                ref={favoritesStatsRef} 
                className="flex flex-wrap gap-4 p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-lg border border-blue-100 dark:border-gray-600"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {currentCount}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Favorites
                  </div>
                </div>
                {userStats && (
                <>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {userStats.totalGenres}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Genres
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 flex items-center">
                      <Star className="w-5 h-5 mr-1" />
                      {userStats.averageRating.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Avg Rating
                    </div>
                  </div>
                </>
              )}
              </div>
            </div>
          </div>

          {/* Favorite Genres Section */}
          {userStats && userStats.topGenres.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-3">
                <TrendingUp className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Your Top Genres
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {userStats.topGenres.map(({ genre }, index) => (
                  <div
                    key={genre}
                    className={`px-3 py-2 rounded-full text-sm font-medium ${
                      index === 0
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : index === 1
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}
                  >
                    {genre}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Latest Activity */}
          {userStats?.latestGame && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Latest addition: <span className="font-medium text-gray-900 dark:text-white">
                  {userStats.latestGame.gameName}
                </span> on {new Date(userStats.latestGame.addedAt).toLocaleDateString()}
              </div>
            </div>
          )}

          {/* Share Stats Button Section */}
          {!loading && favorites.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    Share Your Gaming Journey
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Export a beautiful card of your gaming favorites to share with friends
                  </p>
                </div>
                <button
                  onClick={handleScreenshotFavorites}
                  disabled={isScreenshotting}
                  className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 disabled:bg-blue-200 disabled:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-400 rounded-lg transition-colors"
                >
                  {isScreenshotting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mr-2"></div>
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  {isScreenshotting ? 'Creating...' : 'Export Stats Card'}
                </button>
              </div>
            </div>
          )}

          {/* Delete Account Section - Always visible when logged in */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            {isAdmin ? (
              <div className="flex items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
                <span className="text-sm text-yellow-800 dark:text-yellow-200">
                  Admin accounts cannot be deleted for security reasons.
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    Account Management
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Permanently delete your account and all data
                  </p>
                </div>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Favorites Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Heart className="w-6 h-6 text-red-500" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                My Favorites
              </h2>
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full text-sm">
                {currentCount}/20
              </span>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading favorites...</p>
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No favorites yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Start exploring games and add them to your favorites by clicking the heart icon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map((favorite) => (
                <div
                  key={favorite.id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    {favorite.gameImage && (
                      <Image
                        src={favorite.gameImage}
                        alt={favorite.gameName}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {favorite.gameName}
                      </h4>
                      {favorite.gameRating && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Rating: {favorite.gameRating}/5
                        </div>
                      )}
                      {favorite.gameGenres && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {favorite.gameGenres}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        Added {new Date(favorite.addedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentCount >= 20 && (
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                You've reached the maximum of 20 favorites. Remove some to add new ones!
              </p>
            </div>
          )}
        </div>
      </div>

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteAccount}
        isDeleting={isDeleting}
        userEmail={session?.user?.email || undefined}
      />
    </div>
  )
}
