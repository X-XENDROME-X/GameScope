'use client'

import { useEffect, useState } from 'react'
import { Heart, AlertTriangle, CheckCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface FavoritesNotificationProps {
  count: number
  isVisible: boolean
  onDismiss?: () => void
  showDismiss?: boolean
}

export function FavoritesNotification({ 
  count, 
  isVisible, 
  onDismiss,
  showDismiss = false 
}: FavoritesNotificationProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  
  // Determine notification type based on count
  const notificationType = count >= 20 ? 'limit-reached' : count >= 18 ? 'warning' : 'normal'
  
  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true)
      // Auto-dismiss warning after 5 seconds, but keep limit-reached persistent
      if (notificationType === 'warning' && onDismiss) {
        const timer = setTimeout(() => {
          setIsAnimating(false)
          setTimeout(onDismiss, 300) // Wait for animation to complete
        }, 5000)
        return () => clearTimeout(timer)
      }
    } else {
      setIsAnimating(false)
    }
  }, [isVisible, notificationType, onDismiss])

  if (!isVisible) return null

  const getNotificationConfig = () => {
    switch (notificationType) {
      case 'limit-reached':
        return {
          icon: AlertTriangle,
          iconColor: 'text-red-500',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          textColor: 'text-red-800 dark:text-red-200',
          descriptionColor: 'text-red-700 dark:text-red-300',
          buttonColor: 'border-red-300 text-red-700 hover:bg-red-100 dark:hover:bg-red-900/40',
          title: `Favorites limit reached (${count}/20)`,
          description: 'Remove some favorites to add new games to your collection.'
        }
      case 'warning':
        return {
          icon: Heart,
          iconColor: 'text-yellow-600',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          textColor: 'text-yellow-800 dark:text-yellow-200',
          descriptionColor: 'text-yellow-700 dark:text-yellow-300',
          buttonColor: 'border-yellow-300 text-yellow-700 hover:bg-yellow-100 dark:hover:bg-yellow-900/40',
          title: `Almost at limit (${count}/20)`,
          description: 'You can add a few more games to your favorites.'
        }
      default:
        return {
          icon: CheckCircle,
          iconColor: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          textColor: 'text-green-800 dark:text-green-200',
          descriptionColor: 'text-green-700 dark:text-green-300',
          buttonColor: 'border-green-300 text-green-700 hover:bg-green-100 dark:hover:bg-green-900/40',
          title: `${count} favorites added`,
          description: 'Keep exploring and adding games you love!'
        }
    }
  }

  const config = getNotificationConfig()
  const IconComponent = config.icon

  return (
    <div 
      className={cn(
        "transition-all duration-300 ease-in-out transform mb-6",
        isAnimating 
          ? "opacity-100 translate-y-0 scale-100" 
          : "opacity-0 -translate-y-2 scale-95"
      )}
    >
      <div className={cn(
        "p-4 rounded-lg border",
        config.bgColor,
        config.borderColor
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconComponent className={cn("w-5 h-5", config.iconColor)} />
            <div>
              <h4 className={cn("text-sm font-medium", config.textColor)}>
                {config.title}
              </h4>
              <p className={cn("text-sm mt-1", config.descriptionColor)}>
                {config.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {notificationType === 'limit-reached' && (
              <Link href="/favorites">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={config.buttonColor}
                >
                  Manage Favorites
                </Button>
              </Link>
            )}
            
            {showDismiss && onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAnimating(false)
                  setTimeout(onDismiss, 300)
                }}
                className={cn(
                  "h-8 w-8 p-0 hover:bg-transparent",
                  config.textColor
                )}
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
