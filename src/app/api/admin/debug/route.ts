import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { sql } from 'drizzle-orm'

// Restrict access to configured admin emails only
const ADMIN_EMAILS = process.env.ADMIN_EMAIL?.split(',').map(e => e.trim()) || []

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    // Only allow configured admins to access this diagnostic endpoint
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if isAdmin column exists
    const columnCheck = await db.execute(
      sql`SELECT column_name FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'is_admin'`
    )

    // Get all users with admin status
    let usersWithAdmin = []
    if (columnCheck.rows.length > 0) {
      usersWithAdmin = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name
        })
        .from(users)
    } else {
      // If no isAdmin column, get users without admin status
      usersWithAdmin = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name
        })
        .from(users)
    }

    // Check environment admins
    const envAdmins = process.env.ADMIN_EMAIL?.split(',').map(email => email.trim()) || []

    return NextResponse.json({
      hasAdminColumn: columnCheck.rows.length > 0,
      currentUser: session.user.email,
      envAdmins,
      users: usersWithAdmin,
      session: {
        user: session.user,
        expires: session.expires
      }
    })
  } catch (error) {
    console.error('Database status check error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to check database status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
