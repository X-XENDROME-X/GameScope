import { Game, Platform } from '@/types/game'

/**
 * Platform store URL utilities
 * Generates store URLs for different platforms based on game information
 */
export class PlatformUtils {
  /**
   * Generate store URL for a specific platform
   */
  static getStoreUrl(game: Game, platform: Platform): string | null {
    const platformName = platform.platform.name.toLowerCase()
    
    // Platform-specific store URLs
    switch (true) {
      // PC Platforms
      case platformName.includes('pc') || platformName === 'windows':
        return `https://store.steampowered.com/search/?term=${encodeURIComponent(game.name)}`
      
      // PlayStation
      case platformName.includes('playstation') || platformName.includes('ps'):
        if (platformName.includes('5') || platformName.includes('ps5')) {
          return `https://store.playstation.com/en-us/search/${encodeURIComponent(game.name)}`
        } else if (platformName.includes('4') || platformName.includes('ps4')) {
          return `https://store.playstation.com/en-us/search/${encodeURIComponent(game.name)}`
        }
        return `https://store.playstation.com/en-us/search/${encodeURIComponent(game.name)}`
      
  // Xbox
  case platformName.includes('xbox'):
    return `https://www.microsoft.com/en-us/search/shop/games?q=${encodeURIComponent(game.name)}`
  
  // Nintendo Switch
  case platformName.includes('nintendo') || platformName.includes('switch'):
    return `https://www.nintendo.com/store/search/?q=${encodeURIComponent(game.name)}`

  // iOS
  case platformName.includes('ios') || platformName.includes('iphone') || platformName.includes('ipad'):
    return `https://apps.apple.com/us/search?term=${encodeURIComponent(game.name)}`

  // Android
  case platformName.includes('android'):
    return `https://play.google.com/store/search?q=${encodeURIComponent(game.name)}&c=apps`

  // Epic Games Store
  case platformName.includes('epic'):
    return `https://store.epicgames.com/en-US/browse?q=${encodeURIComponent(game.name)}&sortBy=relevancy`

  // Mac (Redirect to Mac section of App Store)
  case platformName.includes('mac'):
    return `https://apps.apple.com/us/search?term=${encodeURIComponent(game.name)}&platform=mac`

  // Linux (Most Linux-compatible games are on Steam)
  case platformName.includes('linux'):
    return `https://store.steampowered.com/search/?term=${encodeURIComponent(game.name)}&os=linux`

  default:
    // Generic fallback (Steam)
    return `https://store.steampowered.com/search/?term=${encodeURIComponent(game.name)}`
  }
}
  /**
   * Check if platform is clickable (has a store)
   */
  static isClickablePlatform(platform: Platform): boolean {
    const platformName = platform.platform.name.toLowerCase()
    
    // List of platforms that have digital stores
    const clickablePlatforms = [
      'pc', 'windows', 'playstation', 'ps4', 'ps5', 'xbox', 'nintendo', 'switch',
      'ios', 'iphone', 'ipad', 'android', 'epic', 'mac', 'linux'
    ]
    
    return clickablePlatforms.some(clickable => 
      platformName.includes(clickable)
    )
  }

  /**
   * Get display name for store link
   */
  static getStoreName(platform: Platform): string {
    const platformName = platform.platform.name.toLowerCase()
    
    switch (true) {
      case platformName.includes('pc') || platformName === 'windows':
        return 'Steam Store'
      case platformName.includes('playstation') || platformName.includes('ps'):
        return 'PlayStation Store'
      case platformName.includes('xbox'):
        return 'Microsoft Store'
      case platformName.includes('nintendo') || platformName.includes('switch'):
        return 'Nintendo eShop'
      case platformName.includes('ios') || platformName.includes('iphone') || platformName.includes('ipad'):
        return 'App Store'
      case platformName.includes('android'):
        return 'Google Play'
      case platformName.includes('epic'):
        return 'Epic Games Store'
      case platformName.includes('mac'):
        return 'Mac App Store'
      case platformName.includes('linux'):
        return 'Steam Store'
      default:
        return 'Store'
    }
  }

  /**
   * Create slug from game name
   */
  private static createSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  /**
   * Get platform icon color for hover states
   */
  static getPlatformHoverColor(platform: Platform): string {
    const platformName = platform.platform.name.toLowerCase()
    
    switch (true) {
      case platformName.includes('linux'):
        return 'hover:border-orange-500 hover:bg-orange-100 dark:hover:bg-orange-900'
      case platformName.includes('playstation') || platformName.includes('ps'):
        return 'hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950'
      case platformName.includes('xbox'):
        return 'hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-950'
      case platformName.includes('nintendo') || platformName.includes('switch'):
        return 'hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-950'
      case platformName.includes('pc') || platformName === 'windows':
        return 'hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950'
      case platformName.includes('ios') || platformName.includes('mac'):
        return 'hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-950'
      case platformName.includes('android'):
        return 'hover:border-lime-400 hover:bg-lime-50 dark:hover:bg-lime-950'
      default:
        return 'hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950'
    }
  }
}
