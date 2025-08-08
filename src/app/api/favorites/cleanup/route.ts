import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { sql } from 'drizzle-orm'

// Admin only endpoint to clean up duplicate favorites and sync counts
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin
    const ADMIN_EMAILS = process.env.ADMIN_EMAIL?.split(',').map(email => email.trim()) || []
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Remove duplicates, keeping only the latest entry for each user-game combination
    const duplicatesQuery = sql`
      WITH RankedFavorites AS (
        SELECT id, 
               ROW_NUMBER() OVER (
                 PARTITION BY user_id, game_id 
                 ORDER BY added_at DESC
               ) as rn
        FROM favorites
      )
      DELETE FROM favorites 
      WHERE id IN (
        SELECT id FROM RankedFavorites WHERE rn > 1
      )
    `
    
    const duplicateResult = await db.execute(duplicatesQuery)
    
    // 2. Sync favorites count in users table with actual favorites count
    const syncQuery = sql`
      UPDATE users 
      SET favorites_count = (
        SELECT COUNT(*) 
        FROM favorites 
        WHERE favorites.user_id = users.id
      )
    `
    
    const syncResult = await db.execute(syncQuery)
    
    // Get stats after cleanup
    const totalFavorites = await db.execute(sql`SELECT COUNT(*) as count FROM favorites`)
    const totalUsers = await db.execute(sql`SELECT COUNT(*) as count FROM users`)
    const userCountMismatch = await db.execute(sql`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE favorites_count != (
        SELECT COUNT(*) FROM favorites WHERE favorites.user_id = users.id
      )
    `)
    
    return NextResponse.json({
      success: true,
      message: 'Cleanup and sync completed successfully',
      results: {
        duplicatesRemoved: duplicateResult.rowCount || 0,
        usersUpdated: syncResult.rowCount || 0,
        totalFavorites: Number(totalFavorites.rows[0]?.count || 0),
        totalUsers: Number(totalUsers.rows[0]?.count || 0),
        remainingMismatches: Number(userCountMismatch.rows[0]?.count || 0)
      }
    })
  } catch (error) {
    console.error('Error in cleanup:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
