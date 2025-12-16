import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all' // all, completed, ongoing, saved, created

    let events: any[] = []

    if (type === 'completed') {
      // Events where user participated and event is completed
      const participants = await prisma.eventParticipant.findMany({
        where: {
          userId: session.user.id,
          status: 'ACCEPTED',
          event: {
            status: 'COMPLETED',
          },
        },
        include: {
          event: {
            include: {
              recruiter: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
              _count: {
                select: {
                  participants: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
      events = participants.map((p) => ({
        ...p.event,
        participantStatus: p.status,
        participantsCount: p.event._count.participants,
      }))
    } else if (type === 'ongoing') {
      // Events where user is participating and event is in progress
      const participants = await prisma.eventParticipant.findMany({
        where: {
          userId: session.user.id,
          status: 'ACCEPTED',
          event: {
            status: 'IN_PROGRESS',
          },
        },
        include: {
          event: {
            include: {
              recruiter: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
              _count: {
                select: {
                  participants: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
      events = participants.map((p) => ({
        ...p.event,
        participantStatus: p.status,
        participantsCount: p.event._count.participants,
      }))
    } else if (type === 'saved') {
      // Events saved by user
      const savedEvents = await prisma.savedEvent.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          event: {
            include: {
              recruiter: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
              _count: {
                select: {
                  participants: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
      events = savedEvents.map((se) => ({
        ...se.event,
        participantsCount: se.event._count.participants,
      }))
    } else if (type === 'created') {
      // Events created by user (for recruiters)
      if (session.user.role !== 'RECRUITER') {
        return NextResponse.json(
          { error: 'Solo i recruiter possono vedere gli eventi creati' },
          { status: 403 }
        )
      }
      const createdEvents = await prisma.event.findMany({
        where: {
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
          _count: {
            select: {
              participants: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
      events = createdEvents.map((e) => ({
        ...e,
        participantsCount: e._count.participants,
      }))
    } else {
      // All events user is involved with
      const participants = await prisma.eventParticipant.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          event: {
            include: {
              recruiter: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
              _count: {
                select: {
                  participants: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
      events = participants.map((p) => ({
        ...p.event,
        participantStatus: p.status,
        participantsCount: p.event._count.participants,
      }))
    }

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching user events:', error)
    return NextResponse.json(
      { error: 'Errore nel caricamento degli eventi' },
      { status: 500 }
    )
  }
}

