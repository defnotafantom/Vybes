import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateQuestProgress } from '@/lib/quests'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        participants: true,
        _count: {
          select: {
            participants: true,
          },
        },
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Evento non trovato' },
        { status: 404 }
      )
    }

    // Check if user is already a participant using findUnique for better performance
    const existingParticipant = await prisma.eventParticipant.findUnique({
      where: {
        eventId_userId: {
          eventId: params.id,
          userId: session.user.id,
        },
      },
    })

    if (existingParticipant) {
      // If already participating, remove participation
      await prisma.eventParticipant.delete({
        where: { id: existingParticipant.id },
      })

      // Quest progress update not needed when removing participation

      return NextResponse.json({ 
        message: 'Partecipazione rimossa',
        participating: false 
      })
    }

    // Check max participants
    if (event.maxParticipants && event._count.participants >= event.maxParticipants) {
      return NextResponse.json(
        { error: 'Evento al completo' },
        { status: 400 }
      )
    }

    // Add participant
    await prisma.eventParticipant.create({
      data: {
        eventId: params.id,
        userId: session.user.id,
        status: 'PENDING',
      },
    })

    // Update quest progress for join_event
    await updateQuestProgress(session.user.id, 'join_event')

    return NextResponse.json({ 
      message: 'Richiesta di partecipazione inviata',
      participating: true 
    })
  } catch (error) {
    console.error('Error participating in event:', error)
    return NextResponse.json(
      { error: 'Errore nella partecipazione all\'evento' },
      { status: 500 }
    )
  }
}


