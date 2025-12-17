import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

// IMPORTANT: Don't throw during module import (can break Vercel build "Collecting page data").
// If NEXTAUTH_SECRET is missing, auth requests will fail at runtime until configured.

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

