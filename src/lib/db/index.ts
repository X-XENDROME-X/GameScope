import { sql } from '@vercel/postgres'
import { drizzle } from 'drizzle-orm/vercel-postgres'
import * as schema from './schema'

// Create the database instance
export const db = drizzle(sql, { schema })

// For type inference
export type Database = typeof db
