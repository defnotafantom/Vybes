import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                username: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    const formattedConversations = conversations.map((conv: typeof conversations[0]) => {
      const otherParticipant = conv.participants.find(
        (p: typeof conv.participants[0]) => p.userId !== session.user.id
      )?.user

      if (!otherParticipant) {
        return null
      }

      const lastMessage = conv.messages[0]
      const unreadCount = conv.messages.filter(
        (m: typeof conv.messages[0]) => m.senderId !== session.user.id && m.status !== 'READ'
      ).length

      return {
        id: conv.id,
        participant: otherParticipant,
        lastMessage: lastMessage
          ? {
              content: lastMessage.content,
              createdAt: lastMessage.createdAt,
            }
          : null,
        unreadCount,
      }
    }).filter(Boolean)

    return NextResponse.json(formattedConversations)
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Errore nel caricamento delle conversazioni' },
      { status: 500 }
    )
  }
}

