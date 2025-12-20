import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import AppleProvider from 'next-auth/providers/apple'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

type UserRole = 'DEFAULT' | 'ARTIST' | 'RECRUITER' | 'ARTIST_RECRUITER'
type AdminRole = 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPERADMIN'

if (!process.env.NEXTAUTH_SECRET) {
  console.warn('⚠️ NEXTAUTH_SECRET is not set.')
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID || '',
      clientSecret: process.env.APPLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
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

        const isEmail = credentials.email.includes('@')
        const user = await prisma.user.findUnique({
          where: isEmail 
            ? { email: credentials.email }
            : { username: credentials.email }
        })

        if (!user || !user.password) {
          return null
        }

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
          adminRole: user.adminRole,
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
    async signIn({ user, account }) {
      // For OAuth, ensure user has password field (set empty for OAuth users)
      if (account?.provider !== 'credentials' && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email }
        })
        if (!existingUser) {
          // Create user for OAuth
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
              password: '', // OAuth users don't have password
              emailVerified: new Date(),
            }
          })
        }
      }
      return true
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
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
    async signIn({ user, account }) {
      // For OAuth, ensure user has password field (set empty for OAuth users)
      if (account?.provider !== 'credentials' && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email }
        })
        if (!existingUser) {
          // Create user for OAuth
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
              password: '', // OAuth users don't have password
              emailVerified: new Date(),
            }
          })
        }
      }
      return true
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}
