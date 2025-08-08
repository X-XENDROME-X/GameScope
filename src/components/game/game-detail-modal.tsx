'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { X, Star, Calendar, Users, Award, Trophy, ExternalLink, Globe, Youtube, MessageCircle } from 'lucide-react'
import { Game, Platform } from '@/types/game'
import { formatDate, formatRating, getMetacriticColor } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { PlatformIcon } from '@/components/ui/platform-icons'
import { gameAPI } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { AdvancedTrailerUtils } from '@/lib/trailer-utils'
import { PlatformUtils } from '@/lib/platform-utils'

interface GameDetailModalProps {
  game: Game | null
  isOpen: boolean
  onClose: () => void
}

export function GameDetailModal({ game, isOpen, onClose }: GameDetailModalProps) {
  const [selectedImage, setSelectedImage] = useState<string>('')
  const [activeImageIndex, setActiveImageIndex] = useState<number>(-1)

  // Function to deduplicate platforms by name (simpler approach)
  const getUniquePlatforms = (platforms: Platform[]) => {
    const seen = new Set<string>()
    const uniquePlatforms: Platform[] = []
    
    platforms.forEach(platform => {
      const normalizedName = platform.platform.name.toLowerCase().trim()
      
      if (!seen.has(normalizedName)) {
        seen.add(normalizedName)
        uniquePlatforms.push(platform)
      }
    })
    
    return uniquePlatforms
  }

  const { data: gameDetails } = useQuery({
    queryKey: ['game-details', game?.id],
    queryFn: () => gameAPI.getGameDetails(game!.id.toString()),
    enabled: !!game?.id,
  })

  const { data: screenshots } = useQuery({
    queryKey: ['game-screenshots', game?.id],
    queryFn: () => gameAPI.getGameScreenshots(game!.id.toString()),
    enabled: !!game?.id,
  })

  const { data: reviews } = useQuery({
    queryKey: ['game-reviews', game?.id],
    queryFn: () => gameAPI.getGameReviews(game!.id.toString(), { page_size: 5 }),
    enabled: !!game?.id,
  })

  useEffect(() => {
    if (isOpen && game) {
      setSelectedImage(game.background_image || '')
      setActiveImageIndex(-1)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, game])

  const handleImageSelect = (imageUrl: string, index: number) => {
    if (activeImageIndex === index) {
      // Clicking the same image again - return to main image
      setSelectedImage(game?.background_image || '')
      setActiveImageIndex(-1)
    } else {
      // Select new image
      setSelectedImage(imageUrl)
      setActiveImageIndex(index)
    }
  }

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
        )
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
        )
      } else {
        stars.push(
          <Star key={i} className="w-5 h-5 text-gray-300 dark:text-gray-600" />
        )
      }
    }
    return stars
  }

  if (!isOpen || !game) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Enhanced Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-4">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">{game.name}</h2>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  {renderStars(game.rating)}
                  <span className="text-white/90 font-medium">
                    ({formatRating(game.rating)})
                  </span>
                </div>
                {game.metacritic && (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Trophy className="w-4 h-4" />
                    <span className="font-bold text-sm">MC: {game.metacritic}</span>
                  </div>
                )}
                {/* Genres - moved here from right column */}
                <div className="flex items-center gap-2 flex-wrap">
                  {game.genres.slice(0, 3).map((genre) => (
                    <span
                      key={genre.id}
                      className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white/90 rounded-full text-xs font-medium border border-white/30"
                    >
                      {genre.name}
                    </span>
                  ))}
                  {game.genres.length > 3 && (
                    <span className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white/70 rounded-full text-xs font-medium border border-white/30">
                      +{game.genres.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Left Column - Images */}
            <div className="lg:col-span-2 space-y-4">
              {/* Main Image */}
              <div className="relative h-64 sm:h-80 lg:h-96 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg">
                {selectedImage && (
                  <Image
                    src={selectedImage}
                    alt={game.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 66vw, 50vw"
                    className="object-cover transition-all duration-500 hover:scale-105"
                    priority
                  />
                )}
              </div>

              {/* Screenshots Thumbnails */}
              {screenshots && screenshots.results.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {screenshots.results.slice(0, 3).map((screenshot, index) => (
                    <div
                      key={screenshot.id}
                      className={`relative h-20 sm:h-24 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                        activeImageIndex === index 
                          ? 'ring-4 ring-blue-500 shadow-lg scale-105' 
                          : 'hover:scale-102 hover:shadow-md'
                      }`}
                      onClick={() => handleImageSelect(screenshot.image, index)}
                    >
                      <Image
                        src={screenshot.image}
                        alt="Game screenshot"
                        fill
                        sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 15vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                    </div>
                  ))}
                </div>
              )}

              {/* Core Game Info - Non-redundant essential data */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Essential Info</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  
                  {game.released && (
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg">
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                        <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Released</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(game.released)}</p>
                      </div>
                    </div>
                  )}

                  {(gameDetails?.esrb_rating || game.esrb_rating) && (
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                        <Award className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Age Rating</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {(gameDetails?.esrb_rating || game.esrb_rating)?.name || 'Not Rated'}
                        </p>
                      </div>
                    </div>
                  )}

                  {(gameDetails?.playtime || game.playtime) && (
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Star className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Playtime</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {gameDetails?.playtime || game.playtime} hours avg
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Studio Information - Developers & Publishers */}
              {((gameDetails?.developers && gameDetails.developers.length > 0) || 
                (gameDetails?.publishers && gameDetails.publishers.length > 0)) && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Studio Info</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {gameDetails?.developers && gameDetails.developers.length > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                          <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">Developer</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {gameDetails.developers.map((dev, index) => (
                              <span key={dev.id}>
                                {dev.name}
                                {index < (gameDetails.developers?.length ?? 0) - 1 ? ', ' : ''}
                              </span>
                            ))}
                          </p>
                        </div>
                      </div>
                    )}

                    {gameDetails?.publishers && gameDetails.publishers.length > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                          <Trophy className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">Publisher</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {gameDetails.publishers.map((pub, index) => (
                              <span key={pub.id}>
                                {pub.name}
                                {index < gameDetails.publishers!.length - 1 ? ', ' : ''}
                              </span>
                            ))}
                          </p>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              )}

              {/* External Links - Enhanced with YouTube Search */}
              {(() => {
                const hasWebsite = (gameDetails?.website || game.website)
                // Show Reddit if we have a direct URL OR always show community search
                const hasReddit = (gameDetails?.reddit_url || game.reddit_url) || true // Always show community search
                // Show Metacritic if we have a direct URL OR if we have a score to search for
                const hasMetacriticLink = (gameDetails?.metacritic_url || game.metacritic_url) || (gameDetails?.metacritic || game.metacritic)
                
                const hasOfficialLinks = hasWebsite || hasReddit || hasMetacriticLink || true // YouTube always available
                
                if (!hasOfficialLinks) return null
                
                return (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <div className="p-1 bg-indigo-100 dark:bg-indigo-900 rounded">
                        <ExternalLink className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      Official Links
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                      
                      {/* Official Website */}
                      {hasWebsite && (
                        <a 
                          href={gameDetails?.website || game.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg hover:shadow-md transition-all duration-200 group border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                        >
                          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg group-hover:scale-110 transition-transform">
                            <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white">Website</p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </a>
                      )}

                      {/* YouTube Trailer Search - Always available */}
                      <a 
                        href={AdvancedTrailerUtils.getOfficialTrailerUrl(game)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg hover:shadow-md transition-all duration-200 group border border-transparent hover:border-red-200 dark:hover:border-red-800"
                      >
                        <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg group-hover:scale-110 transition-transform">
                          <Youtube className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white">Watch Trailer</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors" />
                      </a>

                      {/* Metacritic Review */}
                      {hasMetacriticLink && (
                        <a 
                          href={
                            (gameDetails?.metacritic_url || game.metacritic_url) ||
                            `https://www.metacritic.com/search/${encodeURIComponent(game.name.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-'))}/`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg hover:shadow-md transition-all duration-200 group border border-transparent hover:border-yellow-200 dark:hover:border-yellow-800"
                        >
                          <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg group-hover:scale-110 transition-transform">
                            <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white">Metacritic</p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-yellow-600 transition-colors" />
                        </a>
                      )}

                      {/* Reddit Community */}
                      {hasReddit && (
                        <a 
                          href={
                            (gameDetails?.reddit_url || game.reddit_url) ||
                            `https://www.reddit.com/search/?q=${encodeURIComponent(game.name)}&type=sr`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg hover:shadow-md transition-all duration-200 group border border-transparent hover:border-orange-200 dark:hover:border-orange-800"
                        >
                          <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg group-hover:scale-110 transition-transform">
                            <MessageCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white">Community</p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-orange-600 transition-colors" />
                        </a>
                      )}

                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Right Column - Prioritized Game Information */}
            <div className="space-y-6">
              {/* Description - TOP PRIORITY for user understanding */}
              {(gameDetails?.description_raw || game.description_raw) && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">About This Game</h3>
                  <div className="max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      {gameDetails?.description_raw || game.description_raw || 'No description available.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Ratings & Reviews Breakdown - MEDIUM PRIORITY */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded">
                    <Star className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  Ratings & Reviews
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{formatRating(game.rating)}/5</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">User Score</div>
                  </div>
                  {game.metacritic && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                      <div className={`text-lg font-bold ${getMetacriticColor(game.metacritic)}`}>{game.metacritic}/100</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Metacritic</div>
                    </div>
                  )}
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{game.ratings_count.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Ratings</div>
                  </div>
                  {(gameDetails?.reviews_count || game.reviews_count) && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {(gameDetails?.reviews_count || game.reviews_count)?.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Reviews</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Platform Details - MEDIUM PRIORITY for technical specs */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                {(() => {
                  const uniquePlatforms = getUniquePlatforms(game.platforms)
                  
                  return (
                    <>
                      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                        <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded">
                          <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        Available Platforms
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {uniquePlatforms.map((platform) => {
                          const storeUrl = PlatformUtils.getStoreUrl(game, platform)
                          const isClickable = PlatformUtils.isClickablePlatform(platform)
                          const hoverColor = PlatformUtils.getPlatformHoverColor(platform)
                          
                          const baseClasses = "flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200"
                          const clickableClasses = isClickable 
                            ? `cursor-pointer ${hoverColor}`
                            : "hover:bg-gray-100 dark:hover:bg-gray-600"
                          
                          const PlatformItem = (
                            <div
                              className={`${baseClasses} ${clickableClasses}`}
                              title={isClickable ? `Open in ${PlatformUtils.getStoreName(platform)}` : platform.platform.name}
                            >
                              <PlatformIcon 
                                platform={platform.platform.name} 
                                className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0"
                              />
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {platform.platform.name}
                              </span>
                            </div>
                          )
                          
                          // Return clickable link or non-clickable div
                          return isClickable && storeUrl ? (
                            <a
                              key={platform.platform.id}
                              href={storeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {PlatformItem}
                            </a>
                          ) : (
                            <div key={platform.platform.id}>
                              {PlatformItem}
                            </div>
                          )
                        })}
                      </div>
                    </>
                  )
                })()}
              </div>

              {/* User Review - Best rated review */}
              {reviews && reviews.results.length > 0 && (() => {
                // Find the best review - prioritize highest rating, then longest text as tiebreaker
                const bestReview = reviews.results.reduce((best, current) => {
                  if (current.rating > best.rating) return current
                  if (current.rating === best.rating && current.text.length > best.text.length) return current
                  return best
                }, reviews.results[0])

                return (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                      <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded">
                        <MessageCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      Top User Review
                    </h3>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {bestReview.user?.avatar ? (
                            <div className="relative w-10 h-10 rounded-full overflow-hidden">
                              <Image
                                src={bestReview.user.avatar}
                                alt={bestReview.user?.username || 'Anonymous'}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="font-medium text-gray-900 dark:text-white truncate flex-1">
                              {bestReview.user?.username || 'Anonymous'}
                            </p>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < (bestReview.rating || 0)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300 dark:text-gray-600'
                                  }`}
                                />
                              ))}
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1 whitespace-nowrap">
                                {bestReview.rating}/5
                              </span>
                            </div>
                          </div>
                          <div className="max-h-32 overflow-y-auto pr-2 custom-scrollbar mb-2">
                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                              {(() => {
                                const text = bestReview.text || 'No review text available.'
                                // Strip all HTML tags and decode entities inline
                                return text
                                  .replace(/<[^>]*>/g, '') // Remove all HTML tags
                                  .replace(/&lt;/g, '<')
                                  .replace(/&gt;/g, '>')
                                  .replace(/&amp;/g, '&')
                                  .replace(/&quot;/g, '"')
                                  .replace(/&#x27;/g, "'")
                                  .replace(/&#39;/g, "'")
                                  .replace(/&nbsp;/g, ' ')
                                  .replace(/&hellip;/g, '...')
                                  .replace(/\s+/g, ' ') // Normalize whitespace
                                  .trim()
                              })()}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {bestReview.created ? new Date(bestReview.created).toLocaleDateString() : 'Unknown date'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.7);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.5);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(75, 85, 99, 0.7);
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}
