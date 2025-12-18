import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET poll data
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const poll = await prisma.poll.findUnique({
      where: { postId: params.id },
      include: {
        options: {
          include: {
            _count: { select: { votes: true } },
          },
        },
      },
    })

    if (!poll) {
      return NextResponse.json({ error: 'Poll non trovato' }, { status: 404 })
    }

    const session = await getServerSession(authOptions)
    let userVote = null
    
    if (session?.user?.id) {
      const vote = await prisma.pollVote.findFirst({
        where: {
          userId: session.user.id,
          option: { pollId: poll.id },
        },
        select: { optionId: true },
      })
      userVote = vote?.optionId || null
    }

    const totalVotes = poll.options.reduce((sum, opt) => sum + opt._count.votes, 0)

    return NextResponse.json({
      poll: {
        id: poll.id,
        question: poll.question,
        endsAt: poll.endsAt,
        options: poll.options.map(opt => ({
          id: opt.id,
          text: opt.text,
          votes: opt._count.votes,
          percentage: totalVotes > 0 ? Math.round((opt._count.votes / totalVotes) * 100) : 0,
        })),
        totalVotes,
        userVote,
      },
    })
  } catch (error) {
    console.error('Error fetching poll:', error)
    return NextResponse.json({ error: 'Errore' }, { status: 500 })
  }
}

// POST vote on poll
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const { optionId } = await request.json()

    // Check poll exists and option belongs to it
    const option = await prisma.pollOption.findUnique({
      where: { id: optionId },
      include: { poll: true },
    })

    if (!option || option.poll.postId !== params.id) {
      return NextResponse.json({ error: 'Opzione non valida' }, { status: 400 })
    }

    // Check if poll ended
    if (option.poll.endsAt && new Date() > option.poll.endsAt) {
      return NextResponse.json({ error: 'Sondaggio terminato' }, { status: 400 })
    }

    // Remove existing vote if any
    await prisma.pollVote.deleteMany({
      where: {
        userId: session.user.id,
        option: { pollId: option.pollId },
      },
    })

    // Create new vote
    await prisma.pollVote.create({
      data: {
        optionId,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ success: true, votedFor: optionId })
  } catch (error) {
    console.error('Error voting:', error)
    return NextResponse.json({ error: 'Errore' }, { status: 500 })
  }
}


