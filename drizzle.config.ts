import type { Config } from 'drizzle-kit'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load environment variables from .env.local
function loadEnvLocal() {
  try {
    const envPath = join(process.cwd(), '.env.local')
    const envContent = readFileSync(envPath, 'utf8')
    
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        if (key && valueParts.length) {
          const value = valueParts.join('=')
          process.env[key] = value
        }
      }
    })
  } catch (error) {
    console.error('Error loading .env.local:', error)
  }
}

loadEnvLocal()

export default {
  schema: './src/lib/db/schema.ts',
  out: './src/lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
} satisfies Config
