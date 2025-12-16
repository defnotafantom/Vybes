import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get('token')

  console.log('📧 Email verification request received')
  console.log('🎫 Token:', token ? `${token.substring(0, 10)}...` : 'missing')

  if (!token) {
    console.log('❌ No token provided')
    return NextResponse.redirect(new URL('/login?error=invalid-token', request.url))
  }

  try {
    console.log('🔍 Looking up verification token...')
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      console.log('❌ Token not found')
      return NextResponse.redirect(new URL('/login?error=invalid-token', request.url))
    }

    if (verificationToken.expires < new Date()) {
      console.log('❌ Token expired')
      return NextResponse.redirect(new URL('/login?error=expired-token', request.url))
    }

    console.log('✅ Token valid, verifying user:', verificationToken.identifier)

    // Update user emailVerified
    const user = await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    })

    console.log('✅ User verified:', user.id)

    // Delete verification token
    await prisma.verificationToken.delete({
      where: { token },
    })

    console.log('✅ Verification token deleted')

    return NextResponse.redirect(new URL('/login?verified=true', request.url))
  } catch (error) {
    console.error('❌ Verification error:', error)
    return NextResponse.redirect(new URL('/login?error=verification-failed', request.url))
  }
}

