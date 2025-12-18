import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateEventSchema, validateData } from '@/lib/validations'

export const dynamic = 'force-dynamic'

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

// UPDATE event
export async function PUT(
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

    // Check if event exists and belongs to user
    const existingEvent = await prisma.event.findUnique({
      where: { id: params.id },
      select: { recruiterId: true },
    })

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Evento non trovato' },
        { status: 404 }
      )
    }

    if (existingEvent.recruiterId !== session.user.id) {
      return NextResponse.json(
        { error: 'Non autorizzato a modificare questo evento' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validation = validateData(updateEventSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const data = validation.data

    const updatedEvent = await prisma.event.update({
      where: { id: params.id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.type && { type: data.type }),
        ...(data.status && { status: data.status }),
        ...(data.address && { address: data.address }),
        ...(data.city && { city: data.city }),
        ...(data.country && { country: data.country }),
        ...(data.latitude !== undefined && { latitude: data.latitude }),
        ...(data.longitude !== undefined && { longitude: data.longitude }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.requirements !== undefined && { requirements: data.requirements }),
        ...(data.compensation !== undefined && { compensation: data.compensation }),
        ...(data.maxParticipants !== undefined && { maxParticipants: data.maxParticipants }),
      },
      include: {
        recruiter: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
          },
        },
      },
    })

    return NextResponse.json(updatedEvent)
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { error: 'Errore durante la modifica dell\'evento' },
      { status: 500 }
    )
  }
}

// DELETE event
export async function DELETE(
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

    // Check if event exists and belongs to user
    const existingEvent = await prisma.event.findUnique({
      where: { id: params.id },
      select: { recruiterId: true },
    })

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Evento non trovato' },
        { status: 404 }
      )
    }

    if (existingEvent.recruiterId !== session.user.id) {
      return NextResponse.json(
        { error: 'Non autorizzato a eliminare questo evento' },
        { status: 403 }
      )
    }

    await prisma.event.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true, message: 'Evento eliminato con successo' })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Errore durante l\'eliminazione dell\'evento' },
      { status: 500 }
    )
  }
}

