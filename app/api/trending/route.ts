import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get posts from last 7 days
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    // Get all tags from recent posts
    const recentPosts = await prisma.post.findMany({
      where: {
        createdAt: { gte: weekAgo },
        isDraft: false,
      },
      select: { tags: true },
    })

    // Count tag frequency
    const tagCounts = new Map<string, number>()
    recentPosts.forEach(post => {
      post.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      })
    })

    // Sort by count and get top 10
    const trending = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }))

    // Get trending users (most liked in last week)
    const trendingUsers = await prisma.user.findMany({
      where: {
        posts: {
          some: {
            likes: {
              some: {
                createdAt: { gte: weekAgo },
              },
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        _count: {
          select: {
            posts: true,
            followers: true,
          },
        },
      },
      take: 5,
      orderBy: {
        followers: { _count: 'desc' },
      },
    })

    return NextResponse.json({
      tags: trending,
      users: trendingUsers,
    })
  } catch (error) {
    console.error('Error fetching trending:', error)
    return NextResponse.json({ error: 'Errore' }, { status: 500 })
  }
}

