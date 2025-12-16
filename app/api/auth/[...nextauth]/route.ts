import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

// Validate NEXTAUTH_SECRET before initializing NextAuth
if (!process.env.NEXTAUTH_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error(
    'NEXTAUTH_SECRET is required in production. Please set it in your environment variables.'
  )
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

