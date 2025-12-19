import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST create repost/quote
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const { quote } = await request.json()

    // Check if already reposted
    const existing = await prisma.repost.findUnique({
      where: {
        originalPostId_userId: {
          originalPostId: params.id,
          userId: session.user.id,
        },
      },
    })

    if (existing) {
      // Remove repost
      await prisma.repost.delete({ where: { id: existing.id } })
      return NextResponse.json({ reposted: false })
    }

    // Create repost
    const repost = await prisma.repost.create({
      data: {
        originalPostId: params.id,
        userId: session.user.id,
        quote: quote || null,
      },
    })

    return NextResponse.json({ reposted: true, repost })
  } catch (error) {
    console.error('Error creating repost:', error)
    return NextResponse.json({ error: 'Errore' }, { status: 500 })
  }
}

// GET repost count
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const count = await prisma.repost.count({
      where: { originalPostId: params.id },
    })

    const session = await getServerSession(authOptions)
    let hasReposted = false
    
    if (session?.user?.id) {
      const myRepost = await prisma.repost.findUnique({
        where: {
          originalPostId_userId: {
            originalPostId: params.id,
            userId: session.user.id,
          },
        },
      })
      hasReposted = !!myRepost
    }

    return NextResponse.json({ count, hasReposted })
  } catch (error) {
    return NextResponse.json({ error: 'Errore' }, { status: 500 })
  }
}





