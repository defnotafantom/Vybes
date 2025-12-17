import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateQuestProgress } from '@/lib/quests'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'upcoming'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit
    const session = await getServerSession(authOptions)

    let whereClause: any = {}
    let includeParticipants = false

    // Special "map" mode: show all published markers regardless of date
    // (avoids "created now" markers being filtered out by millisecond drift)
    if (status === 'map') {
      whereClause.status = 'PUBLISHED'
    } else if (status === 'upcoming') {
      whereClause.status = 'PUBLISHED'
      whereClause.startDate = { gte: new Date() }
    } else if (status === 'active') {
      whereClause.status = 'IN_PROGRESS'
    } else if (status === 'completed') {
      whereClause.status = 'COMPLETED'
    } else if (status === 'saved' && session?.user?.id) {
      includeParticipants = true
      whereClause.savedBy = {
        some: {
          userId: session.user.id,
        },
      }
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
        recruiter: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        participants: includeParticipants
          ? {
              where: { userId: session?.user?.id },
            }
          : false,
        _count: {
          select: {
            participants: true,
          },
        },
      },
        orderBy: {
          startDate: 'asc',
        },
      }),
      prisma.event.count({ where: whereClause }),
    ])

    const formattedEvents = events.map((event: typeof events[0]) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      type: event.type,
      status: event.status,
      startDate: event.startDate,
      endDate: event.endDate,
      address: event.address,
      city: event.city,
      latitude: event.latitude,
      longitude: event.longitude,
      recruiter: event.recruiter,
      participants: event._count.participants,
    }))

    return NextResponse.json({
      events: formattedEvents,
      pagination: {
        page,
        limit,
        total: total || 0,
        totalPages: Math.ceil((total || 0) / limit),
        hasMore: skip + limit < (total || 0),
      },
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Errore nel caricamento degli eventi' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      )
    }
    
    // Allow both RECRUITER and ARTIST to create markers
    const userRole = session.user.role
    if (!['RECRUITER', 'ARTIST', 'ARTIST_RECRUITER'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Solo recruiter e artisti possono creare eventi' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      type,
      address,
      city,
      country,
      latitude,
      longitude,
      startDate,
      endDate,
      imageUrl,
      requirements,
      compensation,
      maxParticipants,
    } = body

    if (!title || !description || !startDate || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'Campi obbligatori mancanti' },
        { status: 400 }
      )
    }

    // Check if this is the first event
    const existingEvents = await prisma.event.count({
      where: { recruiterId: session.user.id },
    })

    const event = await prisma.event.create({
      data: {
        title,
        description,
        type,
        status: 'PUBLISHED',
        address: address || '',
        city: city || '',
        country: country || 'Italia',
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        imageUrl,
        requirements,
        compensation,
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
        recruiterId: session.user.id,
      },
      include: {
        recruiter: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    // Update quest progress for first event
    if (existingEvents === 0) {
      await updateQuestProgress(session.user.id, 'first_event', true)
    }

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Errore nella creazione dell\'evento' },
      { status: 500 }
    )
  }
}

