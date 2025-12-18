import { Metadata } from 'next'

const siteConfig = {
  name: 'Vybes',
  description: 'La piattaforma social per artisti e recruiter. Connetti, collabora e crea opportunità nel mondo dell\'arte.',
  url: process.env.NEXTAUTH_URL || 'https://vybes.art',
  ogImage: 'https://vybes.art/og-image.jpg',
  keywords: [
    'artisti',
    'recruiter',
    'collaborazioni',
    'arte',
    'musica',
    'danza',
    'teatro',
    'fotografia',
    'social network',
    'opportunità lavoro arte',
  ],
  creator: 'Vybes Team',
  twitterHandle: '@vybesart',
}

/**
 * Generate base metadata for the site
 */
export function generateBaseMetadata(): Metadata {
  return {
    title: {
      default: siteConfig.name,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: siteConfig.keywords,
    authors: [{ name: siteConfig.creator }],
    creator: siteConfig.creator,
    metadataBase: new URL(siteConfig.url),
    openGraph: {
      type: 'website',
      locale: 'it_IT',
      url: siteConfig.url,
      siteName: siteConfig.name,
      title: siteConfig.name,
      description: siteConfig.description,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: siteConfig.name,
      description: siteConfig.description,
      images: [siteConfig.ogImage],
      creator: siteConfig.twitterHandle,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon-16x16.png',
      apple: '/apple-touch-icon.png',
    },
    manifest: '/site.webmanifest',
  }
}

/**
 * Generate metadata for a page
 */
export function generatePageMetadata(
  title: string,
  description?: string,
  options?: {
    image?: string
    noIndex?: boolean
  }
): Metadata {
  const pageDescription = description || siteConfig.description
  
  return {
    title,
    description: pageDescription,
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description: pageDescription,
      images: options?.image ? [{ url: options.image }] : undefined,
    },
    twitter: {
      title: `${title} | ${siteConfig.name}`,
      description: pageDescription,
      images: options?.image ? [options.image] : undefined,
    },
    robots: options?.noIndex ? { index: false, follow: false } : undefined,
  }
}

/**
 * Generate metadata for a user profile
 */
export function generateUserMetadata(user: {
  name?: string | null
  username?: string | null
  bio?: string | null
  image?: string | null
}): Metadata {
  const displayName = user.name || user.username || 'Utente'
  const title = `${displayName} - Profilo`
  const description = user.bio || `Profilo di ${displayName} su Vybes`
  
  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      images: user.image ? [{ url: user.image }] : undefined,
      type: 'profile',
    },
    twitter: {
      title: `${title} | ${siteConfig.name}`,
      description,
      images: user.image ? [user.image] : undefined,
    },
  }
}

/**
 * Generate metadata for an event
 */
export function generateEventMetadata(event: {
  title: string
  description: string
  city?: string
  startDate?: string | Date
  imageUrl?: string | null
}): Metadata {
  const title = event.title
  const location = event.city ? ` a ${event.city}` : ''
  const date = event.startDate 
    ? ` - ${new Date(event.startDate).toLocaleDateString('it-IT')}`
    : ''
  const description = `${event.description.substring(0, 150)}...${location}${date}`
  
  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      images: event.imageUrl ? [{ url: event.imageUrl }] : undefined,
      type: 'article',
    },
    twitter: {
      title: `${title} | ${siteConfig.name}`,
      description,
      images: event.imageUrl ? [event.imageUrl] : undefined,
    },
  }
}

/**
 * Generate JSON-LD structured data for SEO
 */
export function generateJsonLd(type: 'website' | 'profile' | 'event', data?: any) {
  const baseData = {
    '@context': 'https://schema.org',
  }

  switch (type) {
    case 'website':
      return {
        ...baseData,
        '@type': 'WebSite',
        name: siteConfig.name,
        url: siteConfig.url,
        description: siteConfig.description,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${siteConfig.url}/dashboard?search={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      }

    case 'profile':
      return {
        ...baseData,
        '@type': 'Person',
        name: data?.name,
        description: data?.bio,
        image: data?.image,
        url: `${siteConfig.url}/dashboard/users/${data?.id}`,
      }

    case 'event':
      return {
        ...baseData,
        '@type': 'Event',
        name: data?.title,
        description: data?.description,
        startDate: data?.startDate,
        endDate: data?.endDate,
        location: data?.city ? {
          '@type': 'Place',
          name: data.city,
          address: data.address,
        } : undefined,
        image: data?.imageUrl,
        organizer: {
          '@type': 'Person',
          name: data?.recruiter?.name,
        },
      }

    default:
      return baseData
  }
}

