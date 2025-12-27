import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

type UserRole = 'DEFAULT' | 'ARTIST' | 'RECRUITER' | 'ARTIST_RECRUITER'
type AdminRole = 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPERADMIN'

if (!process.env.NEXTAUTH_SECRET) {
  console.warn('⚠️ NEXTAUTH_SECRET is not set.')
}

// Helper to check if OAuth provider is configured
const isGoogleConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)

if (!isGoogleConfigured && process.env.NODE_ENV === 'development') {
  console.warn('⚠️ Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable.')
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    // Google Provider (only if configured)
    ...(isGoogleConfigured ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        allowDangerousEmailAccountLinking: true,
      })
    ] : []),
    // Credentials Provider (always available)
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Verifica che le credenziali siano fornite e non vuote
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email.trim()
        const password = credentials.password.trim()

        if (!email || !password) {
          return null
        }

        try {
          // Cerca solo per username (nickname)
          const user = await prisma.user.findUnique({
            where: { username: email }
          })

          // Verifica che l'utente esista
          if (!user) {
            return null
          }

          // Verifica che l'utente abbia una password (non null e non vuota)
          if (!user.password || user.password.trim() === '') {
            return null
          }

          // Verifica che l'email sia verificata in produzione
          if (!user.emailVerified && process.env.NODE_ENV === 'production') {
            return null
          }

          // Confronta la password con bcrypt
          const isPasswordValid = await bcrypt.compare(
            password,
            user.password
          )

          // Se la password non è valida, restituisci null
          if (!isPasswordValid) {
            return null
          }

          // Restituisci l'utente solo se tutti i controlli sono passati
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            adminRole: user.adminRole,
          }
        } catch (error) {
          // In caso di errore (es. errore database), restituisci null
          console.error('Error in authorize:', error)
          return null
        }
      }
    })
  ],
  pages: {
    signIn: '/auth',
    signOut: '/',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role as UserRole
        token.adminRole = user.adminRole as AdminRole
        token.id = user.id
      }
      // For OAuth users, fetch adminRole from DB
      if (account && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { adminRole: true, role: true }
        })
        if (dbUser) {
          token.adminRole = dbUser.adminRole as AdminRole
          token.role = dbUser.role as UserRole
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role
        session.user.adminRole = token.adminRole as AdminRole
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // For OAuth, ensure user exists and is properly linked
      if (account?.provider !== 'credentials' && user.email) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email }
          })
          
          if (!existingUser) {
            // Create new user for OAuth
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || (profile as any)?.name || null,
                image: user.image || (profile as any)?.picture || null,
                password: '', // OAuth users don't have password
                emailVerified: new Date(),
                role: 'DEFAULT',
                adminRole: 'USER',
              }
            })
          } else if (existingUser.password === null) {
            // Update OAuth user info if needed (but keep password as null)
            await prisma.user.update({
              where: { email: user.email },
              data: {
                name: user.name || existingUser.name,
                image: user.image || existingUser.image,
                emailVerified: existingUser.emailVerified || new Date(),
              }
            })
          }
        } catch (error) {
          console.error('Error in signIn callback:', error)
          // Don't block sign in if user creation fails (PrismaAdapter will handle it)
        }
      }
      return true
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}
