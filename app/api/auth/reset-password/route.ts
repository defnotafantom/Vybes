import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { rateLimit, getClientIP, rateLimitConfigs } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`reset-password:${clientIP}`, rateLimitConfigs.resetPassword)
    
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
    const tokenRaw = (body?.token || '') as string
    const passwordRaw = (body?.password || '') as string

    const token = tokenRaw.trim()
    const password = passwordRaw

    if (!token) {
      return NextResponse.json({ error: 'Link non valido.' }, { status: 400 })
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ error: 'Password troppo corta (min 8 caratteri).' }, { status: 400 })
    }

    // Trova il token di verifica
    const vt = await prisma.verificationToken.findUnique({ where: { token } })
    if (!vt) {
      return NextResponse.json({ error: 'Token non valido o scaduto.' }, { status: 400 })
    }
    
    // Usa l'identifier (email) del token per trovare l'utente
    const email = vt.identifier
    if (vt.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { token } }).catch(() => {})
      return NextResponse.json({ error: 'Token scaduto.' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 10)
    await prisma.user.update({
      where: { email },
      data: { password: hashed },
    })

    await prisma.verificationToken.delete({ where: { token } }).catch(() => {})
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Errore durante il reset password.' }, { status: 500 })
  }
}

