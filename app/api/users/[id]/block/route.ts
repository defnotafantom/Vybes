import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST toggle block user
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    if (session.user.id === params.id) {
      return NextResponse.json({ error: 'Non puoi bloccare te stesso' }, { status: 400 })
    }

    const existing = await prisma.userBlock.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: session.user.id,
          blockedId: params.id,
        },
      },
    })

    if (existing) {
      // Unblock
      await prisma.userBlock.delete({ where: { id: existing.id } })
      return NextResponse.json({ blocked: false })
    } else {
      // Block - also unfollow each other
      await prisma.$transaction([
        prisma.userBlock.create({
          data: {
            blockerId: session.user.id,
            blockedId: params.id,
          },
        }),
        // Remove follow relationships
        prisma.user.update({
          where: { id: session.user.id },
          data: {
            following: { disconnect: { id: params.id } },
            followers: { disconnect: { id: params.id } },
          },
        }),
      ])
      return NextResponse.json({ blocked: true })
    }
  } catch (error) {
    console.error('Error toggling block:', error)
    return NextResponse.json({ error: 'Errore' }, { status: 500 })
  }
}

// GET check if blocked
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const blocked = await prisma.userBlock.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: session.user.id,
          blockedId: params.id,
        },
      },
    })

    return NextResponse.json({ blocked: !!blocked })
  } catch (error) {
    return NextResponse.json({ error: 'Errore' }, { status: 500 })
  }
}

