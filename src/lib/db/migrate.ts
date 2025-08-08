import { migrate } from 'drizzle-orm/vercel-postgres/migrator'
import { db } from './index'
import path from 'path'

export async function runMigration() {
  try {
    console.log('🔄 Running database migrations...')
    
    await migrate(db, { 
      migrationsFolder: path.join(process.cwd(), 'src/lib/db/migrations')
    })
    
    console.log('✅ Database migrations completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

// Run migration if this file is called directly
if (require.main === module) {
  runMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}
