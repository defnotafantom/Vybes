import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit, getClientIP, rateLimitConfigs } from '@/lib/rate-limit'

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // Rate limiting per prevenire enumerazione username
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`check-user:${clientIP}`, {
      limit: 20, // 20 richieste per finestra
      windowSeconds: 60, // 1 minuto
    })
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { user: null },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          }
        }
      )
    }

    const { searchParams } = new URL(request.url)
    const identifier = searchParams.get('identifier')

    if (!identifier) {
      return NextResponse.json({ user: null })
    }

    // Cerca solo per username per evitare account enumeration tramite email
    const user = await prisma.user.findUnique({
      where: { username: identifier },
      select: {
        id: true,
        // Non esporre email per evitare account enumeration
        username: true,
        name: true,
        image: true,
        avatar: {
          select: {
            id: true,
            face: true,
            eyes: true,
            hair: true,
            top: true,
            bottom: true,
            accessories: true,
          }
        },
        useAvatar: true,
        role: true,
      },
    })

    if (!user) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error checking user:', error)
    return NextResponse.json({ user: null })
  }
}

