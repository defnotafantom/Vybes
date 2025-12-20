import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendPasswordResetEmail } from '@/lib/email'
import { rateLimit, getClientIP, rateLimitConfigs } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

function getBaseUrl() {
  const env = process.env.NEXTAUTH_URL
  if (env) return env.replace(/\/+$/, '')
  // Vercel provides VERCEL_URL without protocol
  const vercel = process.env.VERCEL_URL
  if (vercel) return `https://${vercel}`.replace(/\/+$/, '')
  return 'http://localhost:3000'
}

export async function POST(request: Request) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`forgot-password:${clientIP}`, rateLimitConfigs.forgotPassword)
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Troppe richieste. Riprova più tardi.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          }
        }
      )
    }

    const body = await request.json().catch(() => ({}))
    const identifierRaw = (body?.identifier || body?.email || '') as string
    const identifier = identifierRaw.trim().toLowerCase()

    if (!identifier || identifier.length < 3) {
      return NextResponse.json({ error: 'Inserisci email o username.' }, { status: 400 })
    }

    const isEmail = identifier.includes('@')
    const user = await prisma.user.findUnique({
      where: isEmail ? { email: identifier } : { username: identifier },
      select: { email: true },
    })

    // Always return ok to avoid user enumeration.
    if (!user?.email) {
      return NextResponse.json({ ok: true })
    }

    // Create one-time token (1 hour)
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000)

    // Remove existing tokens for this email (best-effort)
    await prisma.verificationToken.deleteMany({ where: { identifier: user.email } }).catch(() => {})

    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token,
        expires,
      },
    })

    const resetUrl = `${getBaseUrl()}/auth/reset-password?email=${encodeURIComponent(user.email)}&token=${encodeURIComponent(token)}`
    await sendPasswordResetEmail(user.email, resetUrl)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Errore durante la richiesta.' }, { status: 500 })
  }
}








import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendPasswordResetEmail } from '@/lib/email'
import { rateLimit, getClientIP, rateLimitConfigs } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

function getBaseUrl() {
  const env = process.env.NEXTAUTH_URL
  if (env) return env.replace(/\/+$/, '')
  // Vercel provides VERCEL_URL without protocol
  const vercel = process.env.VERCEL_URL
  if (vercel) return `https://${vercel}`.replace(/\/+$/, '')
  return 'http://localhost:3000'
}

export async function POST(request: Request) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`forgot-password:${clientIP}`, rateLimitConfigs.forgotPassword)
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Troppe richieste. Riprova più tardi.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          }
        }
      )
    }

    const body = await request.json().catch(() => ({}))
    const identifierRaw = (body?.identifier || body?.email || '') as string
    const identifier = identifierRaw.trim().toLowerCase()

    if (!identifier || identifier.length < 3) {
      return NextResponse.json({ error: 'Inserisci email o username.' }, { status: 400 })
    }

    const isEmail = identifier.includes('@')
    const user = await prisma.user.findUnique({
      where: isEmail ? { email: identifier } : { username: identifier },
      select: { email: true },
    })

    // Always return ok to avoid user enumeration.
    if (!user?.email) {
      return NextResponse.json({ ok: true })
    }

    // Create one-time token (1 hour)
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000)

    // Remove existing tokens for this email (best-effort)
    await prisma.verificationToken.deleteMany({ where: { identifier: user.email } }).catch(() => {})

    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token,
        expires,
      },
    })

    const resetUrl = `${getBaseUrl()}/auth/reset-password?email=${encodeURIComponent(user.email)}&token=${encodeURIComponent(token)}`
    await sendPasswordResetEmail(user.email, resetUrl)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Errore durante la richiesta.' }, { status: 500 })
  }
}









