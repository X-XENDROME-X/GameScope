import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// Debug endpoint to check session and user data - DEVELOPMENT ONLY
export async function GET() {
  // Block debug endpoint in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Debug endpoints disabled in production' }, { status: 403 })
  }

  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No session' }, { status: 401 })
    }

    // Get user from database by email
    const dbUser = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1)
    
    return NextResponse.json({
      session: {
        user: session.user,
        expires: session.expires
      },
      dbUser: dbUser[0] || null
    })
  } catch (error) {
    console.error('Debug session error:', error)
    return NextResponse.json({ error: 'Failed to get session debug info' }, { status: 500 })
  }
}
