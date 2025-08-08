import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatRating(rating: number) {
  return Math.round(rating * 10) / 10
}

export function getPlatformIcon(platform: string) {
  const platformIcons: { [key: string]: string } = {
    'PC': '🖥️',
    'PlayStation': '🎮',
    'Xbox': '🎮',
    'Nintendo': '🎮',
    'iOS': '📱',
    'Android': '📱',
  }
  return platformIcons[platform] || '🎮'
}

export function getMetacriticColor(score: number) {
  if (score >= 90) return 'text-emerald-600 dark:text-emerald-400' // Excellent - Dark Green
  if (score >= 80) return 'text-green-600 dark:text-green-400'     // Great - Green  
  if (score >= 70) return 'text-lime-600 dark:text-lime-400'       // Good - Light Green
  if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'   // Mixed - Yellow
  if (score >= 50) return 'text-orange-600 dark:text-orange-400'   // Generally Unfavorable - Orange
  return 'text-red-600 dark:text-red-400'                          // Overwhelmingly Negative - Red
}

export function getMetacriticBgColor(score: number) {
  if (score >= 90) return 'bg-emerald-100 dark:bg-emerald-900'     // Excellent - Dark Green
  if (score >= 80) return 'bg-green-100 dark:bg-green-900'         // Great - Green
  if (score >= 70) return 'bg-lime-100 dark:bg-lime-900'           // Good - Light Green
  if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900'       // Mixed - Yellow
  if (score >= 50) return 'bg-orange-100 dark:bg-orange-900'       // Generally Unfavorable - Orange
  return 'bg-red-100 dark:bg-red-900'                              // Overwhelmingly Negative - Red
}

export function getMetacriticDotColor(score: number) {
  if (score >= 90) return 'bg-emerald-400'     // Excellent - Dark Green
  if (score >= 80) return 'bg-green-400'       // Great - Green
  if (score >= 70) return 'bg-lime-400'        // Good - Light Green
  if (score >= 60) return 'bg-yellow-400'      // Mixed - Yellow
  if (score >= 50) return 'bg-orange-400'      // Generally Unfavorable - Orange
  return 'bg-red-400'                          // Overwhelmingly Negative - Red
}

export function getMetacriticTextOnDark(score: number) {
  if (score >= 90) return 'text-emerald-300'   // Excellent - Light Green for dark bg
  if (score >= 80) return 'text-green-300'     // Great - Green for dark bg
  if (score >= 70) return 'text-lime-300'      // Good - Light Green for dark bg
  if (score >= 60) return 'text-yellow-300'    // Mixed - Yellow for dark bg
  if (score >= 50) return 'text-orange-300'    // Generally Unfavorable - Orange for dark bg
  return 'text-red-300'                        // Overwhelmingly Negative - Red for dark bg
}
