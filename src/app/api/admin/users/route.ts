import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, favorites } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'

// Admin emails - loaded from environment
const ADMIN_EMAILS = process.env.ADMIN_EMAIL?.split(',').map(email => email.trim()) || []

async function checkAdminAccess() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return false
  }
  
  return true
}

export async function GET() {
  try {
    const isAdmin = await checkAdminAccess()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all users with their favorite counts and real-time active status
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        createdAt: users.createdAt,
        favoritesCount: users.favoritesCount,
        isActive: sql<boolean>`
          EXISTS (
            SELECT 1 FROM sessions s 
            WHERE s."userId" = ${users.id} 
            AND s.expires > NOW()
          )
        `.as('isActive'),
      })
      .from(users)
      .orderBy(sql`${users.createdAt} DESC`)

    // Get total counts for dashboard
    const totalUsers = allUsers.length
    
    // Get actual active users based on valid sessions
    const activeUsersQuery = await db.execute(sql`
      SELECT COUNT(DISTINCT s."userId") as count 
      FROM sessions s 
      JOIN users u ON s."userId" = u.id 
      WHERE s.expires > NOW()
    `)
    const activeUsers = Number(activeUsersQuery.rows[0]?.count || 0)
    
    const totalFavorites = allUsers.reduce((sum, user) => sum + (user.favoritesCount || 0), 0)

    return NextResponse.json({
      users: allUsers,
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        totalFavorites,
        averageFavoritesPerUser: totalUsers > 0 ? (totalFavorites / totalUsers).toFixed(1) : 0
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAccess()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get current admin user to prevent self-deletion
    const session = await getServerSession(authOptions)
    const userToDelete = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (userToDelete.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent admin from deleting themselves
    if (userToDelete[0].email === session?.user?.email) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    // Delete user's favorites first (due to foreign key constraint)
    await db.delete(favorites).where(eq(favorites.userId, userId))
    
    // Delete the user
    await db.delete(users).where(eq(users.id, userId))

    return NextResponse.json({ success: true, message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAccess()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, isActive } = await request.json()

    if (!userId || typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'Valid userId and isActive status required' }, { status: 400 })
    }

    // Update user active status
    await db
      .update(users)
      .set({ isActive })
      .where(eq(users.id, userId))

    return NextResponse.json({ 
      success: true, 
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully` 
    })
  } catch (error) {
    console.error('Error updating user status:', error)
    return NextResponse.json(
      { error: 'Failed to update user status' },
      { status: 500 }
    )
  }
}
