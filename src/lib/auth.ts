import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { db } from './db'
import { accounts, sessions, users, verificationTokens } from './db/schema'
import { eq } from 'drizzle-orm'

// Check if we have OAuth credentials for development
const hasOAuthCredentials = 
  process.env.GOOGLE_CLIENT_ID && 
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id' &&
  process.env.GOOGLE_CLIENT_SECRET !== 'your_google_client_secret'

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: hasOAuthCredentials ? [
  GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Always show Google account chooser on sign-in
      authorization: {
        params: {
          prompt: 'select_account',
          // Ensure standard OAuth code flow
          response_type: 'code'
        }
      },
      // Explicitly map Google profile fields (including image)
      profile: (profile: { sub: string; name?: string; email: string; picture?: string }) => ({
        id: profile.sub,
        name: profile.name ?? null,
        email: profile.email,
        image: profile.picture ?? null,
        emailVerified: null,
      }),
    }),
  ] : [],
  callbacks: {
    session: ({ session, user }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          // Ensure we use the database user values, especially the image
          name: user.name || session.user?.name || null,
          email: user.email || session.user?.email || null,
          image: user.image || session.user?.image || null,
        },
      }
    },
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
  events: {
    // Keep the stored user image in sync with Google's latest picture URL
  async signIn({ user, profile }) {
      try {
    const picture = (profile as { picture?: string } | null | undefined)?.picture
        if (picture && user?.id) {
          await db.update(users).set({ image: picture }).where(eq(users.id, user.id))
        }
      } catch (err) {
        // Non-fatal: avoid blocking sign-in if DB update fails
        console.error('Failed to sync user image on sign-in:', err)
      }
    },
  },
  session: {
    strategy: 'database',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
