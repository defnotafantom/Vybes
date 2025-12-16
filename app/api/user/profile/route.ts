import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get current user profile
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
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        bio: true,
        image: true,
        location: true,
        website: true,
        role: true,
        level: true,
        experience: true,
        reputation: true,
        coins: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
            portfolio: true,
            events: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...user,
      followers: user._count.followers,
      following: user._count.following,
      postsCount: user._count.posts,
      portfolioCount: user._count.portfolio,
      eventsCount: user._count.events,
      isOwnProfile: true,
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Errore nel caricamento del profilo' },
      { status: 500 }
    )
  }
}

// PUT - Update user profile
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
    const { name, username, bio, image, location, website, role, addRoles, removeRoles } = body

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      )
    }

    // Handle role updates
    let newRole = currentUser.role
    if (role) {
      newRole = role
    } else if (addRoles || removeRoles) {
      // Convert current role to array for manipulation
      const roleArray: string[] = []
      if (currentUser.role === 'ARTIST') roleArray.push('ARTIST')
      if (currentUser.role === 'RECRUITER') roleArray.push('RECRUITER')
      if (currentUser.role === 'ARTIST_RECRUITER') {
        roleArray.push('ARTIST')
        roleArray.push('RECRUITER')
      }

      // Add roles
      if (addRoles && Array.isArray(addRoles)) {
        addRoles.forEach((r: string) => {
          if (!roleArray.includes(r)) roleArray.push(r)
        })
      }

      // Remove roles
      if (removeRoles && Array.isArray(removeRoles)) {
        removeRoles.forEach((r: string) => {
          const index = roleArray.indexOf(r)
          if (index > -1) roleArray.splice(index, 1)
        })
      }

      // Convert back to UserRole enum
      if (roleArray.includes('ARTIST') && roleArray.includes('RECRUITER')) {
        newRole = 'ARTIST_RECRUITER'
      } else if (roleArray.includes('ARTIST')) {
        newRole = 'ARTIST'
      } else if (roleArray.includes('RECRUITER')) {
        newRole = 'RECRUITER'
      } else {
        newRole = 'DEFAULT'
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(username !== undefined && { username }),
        ...(bio !== undefined && { bio }),
        ...(image !== undefined && { image }),
        ...(location !== undefined && { location }),
        ...(website !== undefined && { website }),
        ...(newRole !== currentUser.role && { role: newRole as any }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        bio: true,
        image: true,
        location: true,
        website: true,
        role: true,
        level: true,
        experience: true,
        reputation: true,
        coins: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento del profilo' },
      { status: 500 }
    )
  }
}
