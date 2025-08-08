import { NextResponse } from 'next/server'
import { getCurrentUserRole } from '@/lib/admin-utils'

export async function GET() {
  try {
    const userRole = await getCurrentUserRole()
    
    return NextResponse.json({
      isAdmin: userRole.isAdmin,
      // Don't expose email in response for security
    })
  } catch (error) {
    console.error('Admin check error:', error)
    return NextResponse.json({ isAdmin: false }, { status: 500 })
  }
}
