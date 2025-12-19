import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * Health check endpoint to verify database connectivity
 * Useful for debugging 500 errors
 */
export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    
    // Get basic stats
    const userCount = await prisma.user.count()
    const blobConfigured = !!process.env.BLOB_READ_WRITE_TOKEN
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      userCount,
      blobConfigured,
      vercel: process.env.VERCEL === '1',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    console.error('Health check failed:', error)
    console.error('Error details:', { message: errorMessage, stack: errorStack })
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        database: 'disconnected',
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: errorStack }),
      },
      { status: 500 }
    )
  }
}










