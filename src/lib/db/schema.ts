import { pgTable, text, timestamp, integer, boolean, primaryKey, uuid, unique } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import type { AdapterAccount } from 'next-auth/adapters'

// Users table - core user information
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().notNull().primaryKey(),
  name: text('name'),
  email: text('email').notNull(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  favoritesCount: integer('favorites_count').notNull().default(0), // Track favorites for limit enforcement
  isActive: boolean('is_active').notNull().default(true), // For potential account management
})

// NextAuth required tables
export const accounts = pgTable(
  'accounts',
  {
    userId: uuid('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccount['type']>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
)

export const sessions = pgTable('sessions', {
  sessionToken: text('sessionToken').notNull().primaryKey(),
  userId: uuid('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
)

// Favorites table - secure user game favorites
export const favorites = pgTable('favorites', {
  id: uuid('id').defaultRandom().notNull().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  gameId: text('game_id').notNull(), // RAWG game ID
  gameName: text('game_name').notNull(), // Cache for performance
  gameImage: text('game_image'), // Cache for performance
  gameRating: text('game_rating'), // Cache for performance
  gameGenres: text('game_genres'), // JSON string of genres
  gamePlatforms: text('game_platforms'), // JSON string of platforms
  addedAt: timestamp('added_at', { mode: 'date' }).notNull().defaultNow(),
}, (table) => ({
  // Ensure one favorite per user per game
  userGameUnique: unique().on(table.userId, table.gameId),
}))

// Define relationships for better TypeScript support
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  favorites: many(favorites),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
}))

// Export types for use in application
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Favorite = typeof favorites.$inferSelect
export type NewFavorite = typeof favorites.$inferInsert
