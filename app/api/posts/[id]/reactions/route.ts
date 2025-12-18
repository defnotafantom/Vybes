import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const VALID_EMOJIS = ['❤️', '😂', '😮', '😢', '😡', '🔥', '👏', '💯']

// GET reactions for a post
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const reactions = await prisma.reaction.groupBy({
      by: ['emoji'],
      where: { postId: params.id },
      _count: { emoji: true },
    })

    const session = await getServerSession(authOptions)
    let userReactions: string[] = []
    
    if (session?.user?.id) {
      const myReactions = await prisma.reaction.findMany({
        where: { postId: params.id, userId: session.user.id },
        select: { emoji: true },
      })
      userReactions = myReactions.map(r => r.emoji)
    }

    return NextResponse.json({
      reactions: reactions.map(r => ({ emoji: r.emoji, count: r._count.emoji })),
      userReactions,
    })
  } catch (error) {
    console.error('Error fetching reactions:', error)
    return NextResponse.json({ error: 'Errore' }, { status: 500 })
  }
}

// POST toggle reaction
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const { emoji } = await request.json()
    
    if (!VALID_EMOJIS.includes(emoji)) {
      return NextResponse.json({ error: 'Emoji non valida' }, { status: 400 })
    }

    const existing = await prisma.reaction.findUnique({
      where: {
        postId_userId_emoji: {
          postId: params.id,
          userId: session.user.id,
          emoji,
        },
      },
    })

    if (existing) {
      await prisma.reaction.delete({ where: { id: existing.id } })
      return NextResponse.json({ added: false, emoji })
    } else {
      await prisma.reaction.create({
        data: {
          postId: params.id,
          userId: session.user.id,
          emoji,
        },
      })
      return NextResponse.json({ added: true, emoji })
    }
  } catch (error) {
    console.error('Error toggling reaction:', error)
    return NextResponse.json({ error: 'Errore' }, { status: 500 })
  }
}


