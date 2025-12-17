import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const emailRaw = (body?.email || '') as string
    const tokenRaw = (body?.token || '') as string
    const passwordRaw = (body?.password || '') as string

    const email = emailRaw.trim().toLowerCase()
    const token = tokenRaw.trim()
    const password = passwordRaw

    if (!email || !token) {
      return NextResponse.json({ error: 'Link non valido.' }, { status: 400 })
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ error: 'Password troppo corta (min 8 caratteri).' }, { status: 400 })
    }

    const vt = await prisma.verificationToken.findUnique({ where: { token } })
    if (!vt || vt.identifier !== email) {
      return NextResponse.json({ error: 'Token non valido.' }, { status: 400 })
    }
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

