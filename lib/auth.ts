import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

type UserRole = 'DEFAULT' | 'ARTIST' | 'RECRUITER' | 'ARTIST_RECRUITER'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🔐 Authorization attempt for:', credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials')
          return null
        }

        console.log('🔍 Looking up user...')
        // Support both email and username login
        const isEmail = credentials.email.includes('@')
        const user = await prisma.user.findUnique({
          where: isEmail 
            ? { email: credentials.email }
            : { username: credentials.email } // username is stored in email field
        })

        if (!user) {
          console.log('❌ User not found')
          return null
        }

        console.log('👤 User found:', user.id, 'Email verified:', !!user.emailVerified)

        // In development, allow login without email verification if NODE_ENV is development
        if (!user.emailVerified && process.env.NODE_ENV === 'production') {
          console.log('❌ Email not verified (production mode)')
          return null
        }

        if (!user.emailVerified) {
          console.log('⚠️ Email not verified (development mode - allowing anyway)')
        }

        console.log('🔐 Checking password...')
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          console.log('❌ Invalid password')
          return null
        }

        console.log('✅ Authorization successful')
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
}

