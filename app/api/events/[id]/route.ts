import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        recruiter: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
            bio: true,
          },
        },
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
        savedBy: userId
          ? {
              where: { userId },
              select: { userId: true },
            }
          : false,
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

    const isParticipating = userId
      ? event.participants.some((p) => p.userId === userId)
      : false

    const participantStatus = userId
      ? event.participants.find((p) => p.userId === userId)?.status || null
      : null

    const isSaved = userId
      ? event.savedBy && event.savedBy.length > 0
      : false

    return NextResponse.json({
      id: event.id,
      title: event.title,
      description: event.description,
      type: event.type,
      status: event.status,
      startDate: event.startDate,
      endDate: event.endDate,
      address: event.address,
      city: event.city,
      country: event.country,
      latitude: event.latitude,
      longitude: event.longitude,
      imageUrl: event.imageUrl,
      requirements: event.requirements,
      compensation: event.compensation,
      maxParticipants: event.maxParticipants,
      recruiter: event.recruiter,
      participants: event.participants.map((p) => ({
        id: p.id,
        user: p.user,
        status: p.status,
        createdAt: p.createdAt,
      })),
      participantsCount: event._count.participants,
      isParticipating,
      participantStatus,
      isSaved,
      createdAt: event.createdAt,
    })
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { error: 'Errore nel caricamento dell\'evento' },
      { status: 500 }
    )
  }
}

