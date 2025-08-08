import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory counters (in production, use Redis or database)
const usageCounters = {
  apiCalls: new Map<string, { count: number; resetTime: number }>(),
  userSessions: new Set<string>(),
  dailyUsers: new Map<string, number>(),
}

// Rate limiting configurations based on free tier limits
const RATE_LIMITS = {
  // RAWG API: Conservative 50 calls/minute (well under ~100/min limit)
  RAWG_PER_MINUTE: 50,
  // User sessions: Max 100 concurrent (your expected 10-50)
  MAX_CONCURRENT_USERS: 100,
  // Daily active users: Max 200 (conservative for OAuth limits)
  MAX_DAILY_USERS: 200,
  // Database operations per user per session
  DB_OPS_PER_SESSION: 20,
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
            request.headers.get('x-real-ip') || 
            'unknown'
  const userId = request.cookies.get('next-auth.session-token')?.value

  // Skip monitoring for static assets
  if (path.startsWith('/_next/') || path.startsWith('/favicon')) {
    return NextResponse.next()
  }

  // Log usage for monitoring (IP masked for privacy)
  console.log(`[USAGE] ${new Date().toISOString()} - ${request.method} ${path}`)

  // Check RAWG API rate limiting
  if (path.startsWith('/api/games')) {
    if (!checkRAWGRateLimit(ip)) {
      console.warn(`[RATE_LIMIT] RAWG API limit exceeded`)
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please try again in a minute.',
          retryAfter: 60 
        },
        { status: 429 }
      )
    }
  }

  // Check concurrent user limits
  if (userId) {
    usageCounters.userSessions.add(userId)
    if (usageCounters.userSessions.size > RATE_LIMITS.MAX_CONCURRENT_USERS) {
      console.warn(`[CONCURRENT_LIMIT] Too many concurrent users: ${usageCounters.userSessions.size}`)
      // Don't block, just log for monitoring
    }

    // Check daily active users
    const today = new Date().toDateString()
    const dailyCount = usageCounters.dailyUsers.get(today) || 0
    if (dailyCount >= RATE_LIMITS.MAX_DAILY_USERS) {
      console.warn(`[DAILY_LIMIT] Daily user limit reached: ${dailyCount}`)
      // Could implement graceful degradation here
    } else {
      usageCounters.dailyUsers.set(today, dailyCount + 1)
    }
  }

  // Clean up expired sessions and counters
  cleanupCounters()

  return NextResponse.next()
}

function checkRAWGRateLimit(ip: string): boolean {
  const now = Date.now()
  const minute = Math.floor(now / 60000)
  const key = `${ip}:${minute}`
  
  const current = usageCounters.apiCalls.get(key) || { count: 0, resetTime: now + 60000 }
  
  if (current.count >= RATE_LIMITS.RAWG_PER_MINUTE) {
    return false
  }
  
  usageCounters.apiCalls.set(key, { ...current, count: current.count + 1 })
  return true
}

function cleanupCounters() {
  const now = Date.now()
  
  // Clean up old API call counters (older than 5 minutes)
  for (const [key, value] of usageCounters.apiCalls.entries()) {
    if (value.resetTime < now) {
      usageCounters.apiCalls.delete(key)
    }
  }
  
  // Clean up old daily user counters (older than 7 days)
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  for (const [date] of usageCounters.dailyUsers.entries()) {
    if (new Date(date) < weekAgo) {
      usageCounters.dailyUsers.delete(date)
    }
  }
  
  // Clean up user sessions periodically (in production, use proper session management)
  if (Math.random() < 0.01) { // 1% chance to clean up
    usageCounters.userSessions.clear()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
