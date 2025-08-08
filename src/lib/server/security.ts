import { NextRequest, NextResponse } from 'next/server'

// Rate limiting store (in production, use Redis/Database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export interface SecurityConfig {
  maxRequests: number
  windowMs: number
  allowedOrigins: string[]
}

export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
}

export class SecurityError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code?: string
  ) {
    super(message)
    this.name = 'SecurityError'
  }
}

export function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

export function validateOrigin(request: NextRequest, config: SecurityConfig): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return true // Allow requests without origin (direct API calls)
  
  return config.allowedOrigins.some(allowed => 
    allowed === '*' || origin === allowed
  )
}

export function rateLimit(
  clientIP: string, 
  config: SecurityConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const key = `rate_limit:${clientIP}`
  
  let entry = rateLimitStore.get(key)
  
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs
    }
  }
  
  entry.count++
  rateLimitStore.set(key, entry)
  
  // Cleanup old entries periodically
  if (Math.random() < 0.01) { // 1% chance
    for (const [k, v] of rateLimitStore.entries()) {
      if (now > v.resetTime) {
        rateLimitStore.delete(k)
      }
    }
  }
  
  return {
    allowed: entry.count <= config.maxRequests,
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetTime: entry.resetTime
  }
}

export function securityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  }
}

export function withSecurity(
  handler: (request: NextRequest) => Promise<NextResponse> | NextResponse,
  config: SecurityConfig = DEFAULT_SECURITY_CONFIG
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // CORS check
      if (!validateOrigin(request, config)) {
        throw new SecurityError('Origin not allowed', 403, 'ORIGIN_NOT_ALLOWED')
      }
      
      // Rate limiting
      const clientIP = getClientIP(request)
      const rateLimitResult = rateLimit(clientIP, config)
      
      if (!rateLimitResult.allowed) {
        const response = NextResponse.json(
          { error: 'Too many requests', code: 'RATE_LIMIT_EXCEEDED' },
          { status: 429 }
        )
        
        response.headers.set('X-RateLimit-Limit', config.maxRequests.toString())
        response.headers.set('X-RateLimit-Remaining', '0')
        response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString())
        
        return response
      }
      
      // Execute handler
      const response = await handler(request)
      
      // Add security headers
      const headers = securityHeaders()
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      
      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', config.maxRequests.toString())
      response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
      response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString())
      
      return response
      
    } catch (error) {
      console.error('Security middleware error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        ip: getClientIP(request),
        url: request.url,
        userAgent: request.headers.get('user-agent')
      })
      
      if (error instanceof SecurityError) {
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: error.statusCode }
        )
      }
      
      return NextResponse.json(
        { error: 'Internal server error', code: 'INTERNAL_ERROR' },
        { status: 500 }
      )
    }
  }
}
