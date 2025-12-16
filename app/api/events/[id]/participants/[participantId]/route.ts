import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createNotification } from '@/lib/notifications'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; participantId: string } }
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
      select: { recruiterId: true, title: true },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Evento non trovato' },
        { status: 404 }
      )
    }

    // Only recruiter can manage participants
    if (event.recruiterId !== session.user.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { status } = body

    if (!['ACCEPTED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Stato non valido' },
        { status: 400 }
      )
    }

    const participant = await prisma.eventParticipant.findUnique({
      where: { id: params.participantId },
      include: {
        user: {
          select: {
            name: true,
            username: true,
          },
        },
      },
    })

    if (!participant) {
      return NextResponse.json(
        { error: 'Partecipante non trovato' },
        { status: 404 }
      )
    }

    const updatedParticipant = await prisma.eventParticipant.update({
      where: { id: params.participantId },
      data: { status },
    })

    // Create notification for participant
    const recruiter = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, username: true },
    })

    if (recruiter) {
      await createNotification(
        participant.userId,
        'event',
        status === 'ACCEPTED' ? 'Partecipazione Accettata' : 'Partecipazione Rifiutata',
        status === 'ACCEPTED'
          ? `${recruiter.name || recruiter.username || 'Il recruiter'} ha accettato la tua richiesta per "${event.title}"`
          : `${recruiter.name || recruiter.username || 'Il recruiter'} ha rifiutato la tua richiesta per "${event.title}"`,
        `/dashboard/events/${params.id}`
      )
    }

    return NextResponse.json(updatedParticipant)
  } catch (error) {
    console.error('Error updating participant:', error)
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento del partecipante' },
      { status: 500 }
    )
  }
}

