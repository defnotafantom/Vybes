import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Ottieni avatar corrente dell'utente
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    const avatar = await prisma.avatar.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            coins: true,
            useAvatar: true,
          },
        },
      },
    })

    // Se non esiste avatar, creane uno vuoto
    if (!avatar) {
      const newAvatar = await prisma.avatar.create({
        data: {
          userId: session.user.id,
        },
        include: {
          user: {
            select: {
              coins: true,
              useAvatar: true,
            },
          },
        },
      })
      return NextResponse.json({ avatar: newAvatar })
    }

    return NextResponse.json({ avatar })
  } catch (error) {
    console.error('Error fetching avatar:', error)
    return NextResponse.json(
      { error: 'Errore nel caricamento dell\'avatar' },
      { status: 500 }
    )
  }
}

// PUT - Salva configurazione avatar
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { face, eyes, hair, top, bottom, accessories, useAvatar } = body

    // Upsert avatar (create or update)
    const avatar = await prisma.avatar.upsert({
      where: { userId: session.user.id },
      update: {
        face,
        eyes,
        hair,
        top,
        bottom,
        accessories,
      },
      create: {
        userId: session.user.id,
        face,
        eyes,
        hair,
        top,
        bottom,
        accessories,
      },
      include: {
        user: {
          select: {
            coins: true,
            useAvatar: true,
          },
        },
      },
    })

    // Update useAvatar preference if provided
    if (useAvatar !== undefined) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { useAvatar },
      })
    }

    return NextResponse.json({ avatar })
  } catch (error) {
    console.error('Error saving avatar:', error)
    return NextResponse.json(
      { error: 'Errore nel salvataggio dell\'avatar' },
      { status: 500 }
    )
  }
}

