import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createNotification } from '@/lib/notifications'

export async function POST(
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

    const targetUserId = params.id

    if (targetUserId === session.user.id) {
      return NextResponse.json(
        { error: 'Non puoi seguire te stesso' },
        { status: 400 }
      )
    }

    // Check if user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      )
    }

    // Check if already following
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        following: {
          where: { id: targetUserId },
        },
      },
    })

    if (currentUser?.following && currentUser.following.length > 0) {
      // Unfollow
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          following: {
            disconnect: { id: targetUserId },
          },
        },
      })
      return NextResponse.json({ following: false })
    } else {
      // Follow
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          following: {
            connect: { id: targetUserId },
          },
        },
      })

      // Create notification for the followed user
      const follower = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, username: true },
      })

      if (follower) {
        await createNotification(
          targetUserId,
          'follow',
          'Nuovo Follower',
          `${follower.name || follower.username || 'Qualcuno'} ha iniziato a seguirti`,
          `/dashboard/profile`
        )
      }

      return NextResponse.json({ following: true })
    }
  } catch (error) {
    console.error('Error toggling follow:', error)
    return NextResponse.json(
      { error: 'Errore nel follow/unfollow' },
      { status: 500 }
    )
  }
}

