import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

// Admin users - loaded from environment
const ADMIN_EMAILS = process.env.ADMIN_EMAIL?.split(',').map(email => email.trim()) || []

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get database usage stats
    const stats = await getDatabaseStats()
    
    // Calculate usage percentages for all services
    const vercelFunctionUsage = Math.round((stats.totalRequests / 100000) * 100)
    
    // Calculate Neon storage usage percentage (0.5GB = 512MB limit)
    let neonStorageUsage = 'Unknown'
    if (stats.databaseSize && stats.databaseSize !== 'Unknown') {
      const sizeStr = stats.databaseSize.toLowerCase()
      let sizeInMB = 0
      
      if (sizeStr.includes('kb')) {
        sizeInMB = parseFloat(sizeStr) / 1024 // Convert KB to MB
      } else if (sizeStr.includes('mb')) {
        sizeInMB = parseFloat(sizeStr)
      } else if (sizeStr.includes('gb')) {
        sizeInMB = parseFloat(sizeStr) * 1024 // Convert GB to MB
      }
      
      if (sizeInMB > 0) {
        const percentage = (sizeInMB / 512) * 100 // 512MB = 0.5GB limit
        // Show at least 1% for any usage, but round to 2 decimal places for precision
        const displayPercentage = percentage < 1 && percentage > 0 
          ? Math.max(0.01, percentage).toFixed(2)
          : Math.round(percentage)
        neonStorageUsage = `${displayPercentage}%`
      }
    }
    
    // Determine overall health status
    let healthStatus = 'GREEN'
    if (vercelFunctionUsage >= 90) {
      healthStatus = 'RED'
    } else if (vercelFunctionUsage >= 75) {
      healthStatus = 'YELLOW'
    }
    
    // System usage with ACCURATE free tier limits
    const systemStats = {
      timestamp: new Date().toISOString(),
      database: stats,
      estimates: {
        monthlyVercelRequests: stats.estimatedMonthlyRequests,
        monthlyDatabaseQueries: stats.estimatedMonthlyQueries,
      },
      limits: {
        // Vercel Free Tier (Updated Aug 2025)
        vercelBandwidth: { used: '~1-5GB', limit: '100GB', percentage: '~1-5%' },
        vercelFunctions: { used: stats.totalRequests, limit: 100000, percentage: vercelFunctionUsage + '%' },
        
        // Neon Free Tier (Updated 2024 - Storage reduced to 0.5GB)
        neonStorage: { used: stats.databaseSize, limit: '0.5GB', percentage: neonStorageUsage },
        neonCompute: { used: 'Auto-scaling', limit: '191.9h/month', percentage: 'Within limits' },
        
        // Google OAuth (Aug 2025: 100 user cap for unverified apps, unlimited for verified)
        googleOAuth: { 
          used: stats.totalUsers, 
          limit: stats.totalUsers > 100 ? 'Unlimited (Verified)' : '100 (Unverified)', 
          percentage: stats.totalUsers > 100 ? 'No limit' : Math.round((stats.totalUsers / 100) * 100) + '%'
        },
      },
      healthStatus, // GREEN, YELLOW, RED
      recommendations: generateRecommendations(stats, vercelFunctionUsage)
    }

    return NextResponse.json(systemStats)
  } catch (error) {
    console.error('Usage dashboard error:', error)
    return NextResponse.json({ error: 'Failed to fetch usage stats' }, { status: 500 })
  }
}

async function getDatabaseStats() {
  try {
    // Get user count and active user count
    const userCountResult = await db.execute(sql`SELECT COUNT(*) as count FROM users`)
    const userCount = Number(userCountResult.rows[0]?.count || 0)

    // Get active user count based on valid sessions (real active users)
    const activeUserCountResult = await db.execute(sql`
      SELECT COUNT(DISTINCT s."userId") as count 
      FROM sessions s 
      JOIN users u ON s."userId" = u.id 
      WHERE s.expires > NOW()
    `)
    const activeUserCount = Number(activeUserCountResult.rows[0]?.count || 0)

    // Get favorites count from actual favorites table (most accurate)
    const favoritesCountResult = await db.execute(sql`SELECT COUNT(*) as count FROM favorites`)
    const favoritesCount = Number(favoritesCountResult.rows[0]?.count || 0)

    // Get session count (active sessions) - keep for monitoring purposes
    const sessionCountResult = await db.execute(sql`SELECT COUNT(*) as count FROM sessions WHERE expires > NOW()`)
    const activeSessionCount = Number(sessionCountResult.rows[0]?.count || 0)

    // Estimate database size (rough calculation)
    const estimatedSizeKB = (userCount * 2) + (favoritesCount * 1) + (activeSessionCount * 0.5) // KB
    
    return {
      totalUsers: userCount,
      activeUsers: activeUserCount,
      totalFavorites: favoritesCount,
      activeSessions: activeSessionCount,
      databaseSize: Math.round(estimatedSizeKB) + ' KB',
      estimatedMonthlyRequests: Math.max(100, userCount * 50), // Conservative estimate
      estimatedMonthlyQueries: Math.max(200, (userCount * 10) + (favoritesCount * 2)),
      totalRequests: userCount + favoritesCount + activeSessionCount, // Very rough estimate
    }
  } catch (error) {
    console.error('Database stats error:', error)
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalFavorites: 0,
      activeSessions: 0,
      databaseSize: 'Unknown',
      estimatedMonthlyRequests: 0,
      estimatedMonthlyQueries: 0,
      totalRequests: 0,
    }
  }
}

function generateRecommendations(
  stats: {
    totalUsers: number
    totalFavorites: number
    activeSessions: number
    databaseSize: string
  },
  vercelFunctionUsage: number
): string[] {
  const recommendations: string[] = []
  
  // Vercel function usage warnings
  if (vercelFunctionUsage > 90) {
    recommendations.push('🚨 CRITICAL: Vercel function usage >90% - Risk of service interruption')
  } else if (vercelFunctionUsage > 75) {
    recommendations.push('⚠️ WARNING: Vercel function usage >75% - Optimize API routes and caching')
  }
  
  // OAuth verification recommendation (Aug 2025: Critical for unverified apps)
  if (stats.totalUsers > 80 && stats.totalUsers <= 100) {
    recommendations.push('🚨 URGENT: Near 100 user OAuth limit - Verify your Google app ASAP for unlimited users')
  }
  
  // Neon storage warning (0.5GB limit since 2024)
  if (stats.databaseSize && stats.databaseSize.includes('MB')) {
    const sizeNum = parseInt(stats.databaseSize)
    if (sizeNum > 400) { // 400MB+ approaching 500MB limit
      recommendations.push('💾 WARNING: Approaching 0.5GB Neon storage limit - Clean up old data')
    }
  }
  
  // Database optimization
  if (stats.totalFavorites > 1000) {
    recommendations.push('📊 Consider implementing favorite pagination - High favorites count detected')
  }
  
  // Session management
  if (stats.activeSessions > 50) {
    recommendations.push('🔄 High active sessions - Consider implementing session cleanup automation')
  }
  
  if (recommendations.length === 0) {
    recommendations.push('✅ All systems operating well within limits')
  }
  
  return recommendations
}
