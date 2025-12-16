import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const identifier = searchParams.get('identifier')

    if (!identifier) {
      return NextResponse.json({ user: null })
    }

    // Check if identifier is email or username
    const isEmail = identifier.includes('@')
    
    const user = await prisma.user.findUnique({
      where: isEmail 
        ? { email: identifier }
        : { username: identifier },
      select: {
        id: true,
        email: true,
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

