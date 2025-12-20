import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Simple OG meta extractor
async function fetchOGData(url: string) {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VybesBot/1.0)' },
      signal: AbortSignal.timeout(5000),
    })
    
    const html = await response.text()
    
    const getMetaContent = (property: string) => {
      const regex = new RegExp(`<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i')
      const altRegex = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${property}["']`, 'i')
      return html.match(regex)?.[1] || html.match(altRegex)?.[1] || null
    }
    
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
    
    return {
      title: getMetaContent('og:title') || titleMatch?.[1] || null,
      description: getMetaContent('og:description') || getMetaContent('description') || null,
      image: getMetaContent('og:image') || null,
      siteName: getMetaContent('og:site_name') || new URL(url).hostname,
    }
  } catch (error) {
    console.error('Error fetching OG data:', error)
    return null
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    
    if (!url) {
      return NextResponse.json({ error: 'URL richiesto' }, { status: 400 })
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: 'URL non valido' }, { status: 400 })
    }

    // Check cache
    const cached = await prisma.linkPreview.findUnique({
      where: { url },
    })
    
    if (cached) {
      // Return cached if less than 24h old
      const age = Date.now() - cached.updatedAt.getTime()
      if (age < 24 * 60 * 60 * 1000) {
        return NextResponse.json(cached)
      }
    }

    // Fetch fresh data
    const ogData = await fetchOGData(url)
    
    if (!ogData) {
      return NextResponse.json({ error: 'Impossibile ottenere preview' }, { status: 500 })
    }

    // Save to cache
    const preview = await prisma.linkPreview.upsert({
      where: { url },
      update: {
        title: ogData.title,
        description: ogData.description,
        image: ogData.image,
        siteName: ogData.siteName,
      },
      create: {
        url,
        title: ogData.title,
        description: ogData.description,
        image: ogData.image,
        siteName: ogData.siteName,
      },
    })

    return NextResponse.json(preview)
  } catch (error) {
    console.error('Error in link preview:', error)
    return NextResponse.json({ error: 'Errore' }, { status: 500 })
  }
}





import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Simple OG meta extractor
async function fetchOGData(url: string) {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VybesBot/1.0)' },
      signal: AbortSignal.timeout(5000),
    })
    
    const html = await response.text()
    
    const getMetaContent = (property: string) => {
      const regex = new RegExp(`<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i')
      const altRegex = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${property}["']`, 'i')
      return html.match(regex)?.[1] || html.match(altRegex)?.[1] || null
    }
    
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
    
    return {
      title: getMetaContent('og:title') || titleMatch?.[1] || null,
      description: getMetaContent('og:description') || getMetaContent('description') || null,
      image: getMetaContent('og:image') || null,
      siteName: getMetaContent('og:site_name') || new URL(url).hostname,
    }
  } catch (error) {
    console.error('Error fetching OG data:', error)
    return null
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    
    if (!url) {
      return NextResponse.json({ error: 'URL richiesto' }, { status: 400 })
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: 'URL non valido' }, { status: 400 })
    }

    // Check cache
    const cached = await prisma.linkPreview.findUnique({
      where: { url },
    })
    
    if (cached) {
      // Return cached if less than 24h old
      const age = Date.now() - cached.updatedAt.getTime()
      if (age < 24 * 60 * 60 * 1000) {
        return NextResponse.json(cached)
      }
    }

    // Fetch fresh data
    const ogData = await fetchOGData(url)
    
    if (!ogData) {
      return NextResponse.json({ error: 'Impossibile ottenere preview' }, { status: 500 })
    }

    // Save to cache
    const preview = await prisma.linkPreview.upsert({
      where: { url },
      update: {
        title: ogData.title,
        description: ogData.description,
        image: ogData.image,
        siteName: ogData.siteName,
      },
      create: {
        url,
        title: ogData.title,
        description: ogData.description,
        image: ogData.image,
        siteName: ogData.siteName,
      },
    })

    return NextResponse.json(preview)
  } catch (error) {
    console.error('Error in link preview:', error)
    return NextResponse.json({ error: 'Errore' }, { status: 500 })
  }
}







