import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET collection posts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const collection = await prisma.bookmarkCollection.findFirst({
      where: { id: params.id, userId: session.user.id },
      include: {
        posts: {
          orderBy: { addedAt: 'desc' },
          include: {
            post: {
              include: {
                author: {
                  select: { id: true, name: true, username: true, image: true },
                },
              },
            },
          },
        },
      },
    })

    if (!collection) {
      return NextResponse.json({ error: 'Collezione non trovata' }, { status: 404 })
    }

    return NextResponse.json({ collection })
  } catch (error) {
    return NextResponse.json({ error: 'Errore' }, { status: 500 })
  }
}

// POST add post to collection
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const { postId } = await request.json()

    // Verify collection belongs to user
    const collection = await prisma.bookmarkCollection.findFirst({
      where: { id: params.id, userId: session.user.id },
    })

    if (!collection) {
      return NextResponse.json({ error: 'Collezione non trovata' }, { status: 404 })
    }

    // Toggle post in collection
    const existing = await prisma.collectionPost.findUnique({
      where: {
        collectionId_postId: {
          collectionId: params.id,
          postId,
        },
      },
    })

    if (existing) {
      await prisma.collectionPost.delete({ where: { id: existing.id } })
      return NextResponse.json({ added: false })
    }

    await prisma.collectionPost.create({
      data: {
        collectionId: params.id,
        postId,
      },
    })

    return NextResponse.json({ added: true })
  } catch (error) {
    return NextResponse.json({ error: 'Errore' }, { status: 500 })
  }
}

// DELETE collection
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    await prisma.bookmarkCollection.deleteMany({
      where: { id: params.id, userId: session.user.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Errore' }, { status: 500 })
  }
}

