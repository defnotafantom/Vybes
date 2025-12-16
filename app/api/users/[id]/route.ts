import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = params.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        bio: true,
        image: true,
        role: true,
        level: true,
        experience: true,
        reputation: true,
        location: true,
        website: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
            portfolio: true,
          },
        },
        followers: session?.user?.id ? {
          where: { id: session.user.id },
          select: { id: true },
        } : false,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      )
    }

    const isFollowing = session?.user?.id 
      ? user.followers && Array.isArray(user.followers) && user.followers.length > 0
      : false

    return NextResponse.json({
      ...user,
      followers: user._count.followers,
      following: user._count.following,
      postsCount: user._count.posts,
      portfolioCount: user._count.portfolio,
      isFollowing,
      isOwnProfile: session?.user?.id === userId,
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Errore nel caricamento dell\'utente' },
      { status: 500 }
    )
  }
}

