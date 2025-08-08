import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const ADMIN_EMAILS = process.env.ADMIN_EMAIL?.split(',').map(email => email.trim()) || []

export async function isUserAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return false
  }
  
  return ADMIN_EMAILS.includes(session.user.email)
}

export async function getCurrentUserRole(): Promise<{
  isAdmin: boolean
  email: string | null
  name: string | null
}> {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return {
      isAdmin: false,
      email: null,
      name: null
    }
  }
  
  return {
    isAdmin: ADMIN_EMAILS.includes(session.user.email),
    email: session.user.email,
    name: session.user.name || null
  }
}
