import { NextResponse } from 'next/server'
import { withSecurity } from '@/lib/server/security'

async function handler(): Promise<NextResponse> {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  }

  return NextResponse.json(health)
}

export const GET = withSecurity(handler)
