import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, favorites, sessions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// Admin users - loaded from environment
const ADMIN_EMAILS = process.env.ADMIN_EMAIL?.split(',').map(email => email.trim()) || []

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is authenticated
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized - Please sign in' }, { status: 401 })
    }

    // Check if user is admin (admins cannot delete their accounts)
    if (ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ 
        error: 'Admin accounts cannot be deleted for security reasons.' 
      }, { status: 403 })
    }

    const userEmail = session.user.email

    // Start transaction to ensure data consistency
    await db.transaction(async (tx) => {
      // Get user ID first
      const userResult = await tx.select({ id: users.id }).from(users).where(eq(users.email, userEmail))
      
      if (userResult.length === 0) {
        throw new Error('User not found')
      }

      const userId = userResult[0].id

      // Delete user's favorites first (foreign key constraint)
      await tx.delete(favorites).where(eq(favorites.userId, userId))
      
      // Delete user's sessions
      await tx.delete(sessions).where(eq(sessions.userId, userId))
      
      // Finally delete the user account
      await tx.delete(users).where(eq(users.id, userId))
    })

    console.log(`Account deleted successfully for user: ${userEmail}`)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Account deleted successfully' 
    })

  } catch (error) {
    console.error('Account deletion error:', error)
    
    // Return appropriate error message
    if (error instanceof Error) {
      if (error.message === 'User not found') {
        return NextResponse.json({ error: 'User account not found' }, { status: 404 })
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to delete account. Please try again later.' 
    }, { status: 500 })
  }
}
