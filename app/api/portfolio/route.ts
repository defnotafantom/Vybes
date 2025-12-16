import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateQuestProgress } from '@/lib/quests'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'ARTIST') {
      return NextResponse.json(
        { error: 'Solo gli artisti possono accedere al portfolio' },
        { status: 403 }
      )
    }

    const portfolioItems = await prisma.portfolioItem.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(portfolioItems)
  } catch (error) {
    console.error('Error fetching portfolio:', error)
    return NextResponse.json(
      { error: 'Errore nel caricamento del portfolio' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'ARTIST') {
      return NextResponse.json(
        { error: 'Solo gli artisti possono aggiungere al portfolio' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, description, imageUrl, videoUrl, tags, type } = body

    if (!title || !type) {
      return NextResponse.json(
        { error: 'Titolo e tipo sono richiesti' },
        { status: 400 }
      )
    }

    // Check if this is the first portfolio item
    const existingItems = await prisma.portfolioItem.count({
      where: { userId: session.user.id },
    })

    const portfolioItem = await prisma.portfolioItem.create({
      data: {
        title,
        description,
        imageUrl,
        videoUrl,
        tags: tags || [],
        type,
        userId: session.user.id,
      },
    })

    // Update quest progress for first portfolio
    if (existingItems === 0) {
      await updateQuestProgress(session.user.id, 'first_portfolio', true)
    }

    return NextResponse.json(portfolioItem, { status: 201 })
  } catch (error) {
    console.error('Error creating portfolio item:', error)
    return NextResponse.json(
      { error: 'Errore nella creazione del portfolio item' },
      { status: 500 }
    )
  }
}
