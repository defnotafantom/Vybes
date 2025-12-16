import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createNotification } from '@/lib/notifications'

// Socket.io will be handled by the custom server
// For now, we'll emit events through a helper function
async function emitMessage(conversationId: string, message: any) {
  try {
    // In a real implementation, this would use the Socket.io instance
    // For now, clients will poll for new messages
    // Socket.io integration requires custom server setup
  } catch (error) {
    console.error('Error emitting message:', error)
  }
}

export async function GET(
  request: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: params.conversationId },
      include: {
        participants: {
          select: {
            userId: true,
          },
        },
      },
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversazione non trovata' },
        { status: 404 }
      )
    }

    const isParticipant = conversation.participants.some(
      (p: typeof conversation.participants[0]) => p.userId === session.user.id
    )

    if (!isParticipant) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 403 }
      )
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId: params.conversationId,
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: 100,
    })

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId: params.conversationId,
        recipientId: session.user.id,
        status: { not: 'READ' },
      },
      data: {
        status: 'READ',
      },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Errore nel caricamento dei messaggi' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { content } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Il contenuto del messaggio è richiesto' },
        { status: 400 }
      )
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: params.conversationId },
      include: {
        participants: true,
      },
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversazione non trovata' },
        { status: 404 }
      )
    }

    const otherParticipant = conversation.participants.find(
      (p: typeof conversation.participants[0]) => p.userId !== session.user.id
    )

    if (!otherParticipant) {
      return NextResponse.json(
        { error: 'Destinatario non trovato' },
        { status: 400 }
      )
    }

    const message = await prisma.message.create({
      data: {
        conversationId: params.conversationId,
        senderId: session.user.id,
        recipientId: otherParticipant.userId,
        content: content.trim(),
        status: 'SENT',
      },
    })

    // Update conversation updatedAt
    await prisma.conversation.update({
      where: { id: params.conversationId },
      data: { updatedAt: new Date() },
    })

    // Create notification for recipient
    const sender = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, username: true },
    })

    if (sender) {
      await createNotification(
        otherParticipant.userId,
        'message',
        'Nuovo Messaggio',
        `${sender.name || sender.username || 'Qualcuno'} ti ha inviato un messaggio`,
        `/dashboard/messages`
      )
    }

    // Emit socket event (if socket.io is available)
    await emitMessage(params.conversationId, message)

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Errore nell\'invio del messaggio' },
      { status: 500 }
    )
  }
}

