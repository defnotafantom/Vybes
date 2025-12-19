import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET user's bookmark collections
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const collections = await prisma.bookmarkCollection.findMany({
      where: { userId: session.user.id },
      include: {
        _count: { select: { posts: true } },
        posts: {
          take: 4,
          orderBy: { addedAt: 'desc' },
          include: {
            post: {
              select: { id: true, images: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ collections })
  } catch (error) {
    console.error('Error fetching collections:', error)
    return NextResponse.json({ error: 'Errore' }, { status: 500 })
  }
}

// POST create new collection
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const { name } = await request.json()
    
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Nome richiesto' }, { status: 400 })
    }

    const collection = await prisma.bookmarkCollection.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
      },
    })

    return NextResponse.json({ collection })
  } catch (error) {
    console.error('Error creating collection:', error)
    return NextResponse.json({ error: 'Errore' }, { status: 500 })
  }
}





