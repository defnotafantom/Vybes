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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      )
    }

    const quests = await prisma.quest.findMany({
      where: {
        OR: [
          { role: { has: user.role } },
          { role: { isEmpty: true } },
        ],
      },
      include: {
        progress: {
          where: {
            userId: session.user.id,
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const formattedQuests = quests.map((quest: typeof quests[0]) => ({
      id: quest.id,
      title: quest.title,
      description: quest.description,
      type: quest.type,
      experienceReward: quest.experienceReward,
      reputationReward: quest.reputationReward,
      progress: quest.progress[0] || null,
    }))

    return NextResponse.json(formattedQuests)
  } catch (error) {
    console.error('Error fetching quests:', error)
    return NextResponse.json(
      { error: 'Errore nel caricamento delle missioni' },
      { status: 500 }
    )
  }
}

