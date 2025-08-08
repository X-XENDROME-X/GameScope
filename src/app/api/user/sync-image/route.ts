import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users, accounts } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// One-time sync to update user image from Google profile
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get the current user
    const [user] = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1)
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get the Google account data
    const [googleAccount] = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.userId, user.id), eq(accounts.provider, 'google')))
      .limit(1)

    if (!googleAccount || !googleAccount.access_token) {
      return NextResponse.json({ error: 'Google account not linked or no access token' }, { status: 400 })
    }

    // Fetch fresh profile data from Google
    const googleProfileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${googleAccount.access_token}`
      }
    })

    if (!googleProfileResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch Google profile' }, { status: 400 })
    }

    const googleProfile = await googleProfileResponse.json()
    const picture = googleProfile.picture

    if (picture) {
      // Update the user's image in the database
      await db.update(users).set({ image: picture }).where(eq(users.id, user.id))
      
      return NextResponse.json({ 
        success: true, 
        message: 'Profile image updated successfully',
        image: picture 
      })
    } else {
      return NextResponse.json({ error: 'No profile picture found' }, { status: 400 })
    }

  } catch (error) {
    console.error('Sync profile image error:', error)
    return NextResponse.json({ error: 'Failed to sync profile image' }, { status: 500 })
  }
}
