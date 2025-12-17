import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

type UserRole = 'DEFAULT' | 'ARTIST' | 'RECRUITER' | 'ARTIST_RECRUITER'

// Validate required environment variables (keep logs minimal in production)
if (!process.env.NEXTAUTH_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('NEXTAUTH_SECRET is not set (required in production).')
  } else {
    console.warn('⚠️ NEXTAUTH_SECRET is not set. Auth may be unstable in development.')
  }
}

if (!process.env.NEXTAUTH_URL && process.env.NODE_ENV === 'production') {
  console.warn('⚠️ NEXTAUTH_URL is not set in production. This may cause callback URL issues.')
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Support both email and username login
        const isEmail = credentials.email.includes('@')
        const user = await prisma.user.findUnique({
          where: isEmail 
            ? { email: credentials.email }
            : { username: credentials.email } // username is stored in email field
        })

        if (!user) {
          return null
        }

        // In development, allow login without email verification if NODE_ENV is development
        if (!user.emailVerified && process.env.NODE_ENV === 'production') {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
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
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role as UserRole
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}

