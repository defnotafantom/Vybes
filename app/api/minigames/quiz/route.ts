import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get available quizzes
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    // Mock quizzes - will be replaced with real data later
    const quizzes = [
      {
        id: 'quiz-1',
        title: 'Quiz Arte Contemporanea',
        description: 'Testa le tue conoscenze sull\'arte contemporanea',
        questions: 5,
        rewardCoins: 5,
        completionReward: 'outfit-art-lover',
      },
      {
        id: 'quiz-2',
        title: 'Quiz Storia dell\'Arte',
        description: 'Domande sulla storia dell\'arte mondiale',
        questions: 10,
        rewardCoins: 10,
        completionReward: 'outfit-art-historian',
      },
    ]

    // Check which quizzes are completed
    const completedQuizzes = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        type: 'quiz_completion',
      },
      select: {
        metadata: true,
      },
    })

    const completedIds = completedQuizzes
      .map(t => {
        try {
          const meta = JSON.parse(t.metadata || '{}')
          return meta.quizId
        } catch {
          return null
        }
      })
      .filter(Boolean)

    const quizzesWithStatus = quizzes.map(quiz => ({
      ...quiz,
      completed: completedIds.includes(quiz.id),
    }))

    return NextResponse.json({ quizzes: quizzesWithStatus })
  } catch (error) {
    console.error('Error fetching quizzes:', error)
    return NextResponse.json(
      { error: 'Errore nel caricamento dei quiz' },
      { status: 500 }
    )
  }
}

// POST - Submit quiz answer
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { quizId, questionIndex, answer } = body

    if (!quizId || questionIndex === undefined || !answer) {
      return NextResponse.json(
        { error: 'Dati mancanti' },
        { status: 400 }
      )
    }

    // For now, all answers are correct (mockup)
    // Award 1 coin per answer
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        coins: {
          increment: 1,
        },
      },
      select: {
        coins: true,
      },
    })

    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId: session.user.id,
        type: 'quiz_answer',
        amount: 1,
        description: `Quiz risposta corretta`,
        metadata: JSON.stringify({ quizId, questionIndex, answer }),
      },
    })

    return NextResponse.json({
      success: true,
      correct: true,
      coinsEarned: 1,
      newCoins: updatedUser.coins,
    })
  } catch (error) {
    console.error('Error submitting quiz answer:', error)
    return NextResponse.json(
      { error: 'Errore nell\'invio della risposta' },
      { status: 500 }
    )
  }
}

// PUT - Complete quiz
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
    const { quizId, completionReward } = body

    if (!quizId) {
      return NextResponse.json(
        { error: 'Quiz ID mancante' },
        { status: 400 }
      )
    }

    // Check if already completed
    const existingCompletion = await prisma.transaction.findFirst({
      where: {
        userId: session.user.id,
        type: 'quiz_completion',
        metadata: {
          contains: quizId,
        },
      },
    })

    if (existingCompletion) {
      return NextResponse.json(
        { error: 'Quiz già completato' },
        { status: 400 }
      )
    }

    // Award completion reward (outfit item ID)
    // For now, just create transaction record
    await prisma.transaction.create({
      data: {
        userId: session.user.id,
        type: 'quiz_completion',
        amount: 0,
        description: `Quiz completato: ${quizId}`,
        metadata: JSON.stringify({ 
          quizId, 
          completionReward,
          completedAt: new Date().toISOString(),
        }),
      },
    })

    return NextResponse.json({
      success: true,
      completionReward,
      message: 'Quiz completato! Controlla il tuo fitting room per il nuovo outfit.',
    })
  } catch (error) {
    console.error('Error completing quiz:', error)
    return NextResponse.json(
      { error: 'Errore nel completamento del quiz' },
      { status: 500 }
    )
  }
}

