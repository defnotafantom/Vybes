import type { Metadata } from 'next'
import Script from 'next/script'
import { LandingPageClient } from '@/app/_components/landing-page-client'

const baseUrl = process.env.NEXTAUTH_URL || 'https://vybeshub.art'

export const metadata: Metadata = {
  title: 'Vybes',
  description: "Bridging Culture & Opportunity — connect artists, recruiters, and culture lovers.",
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    type: 'website',
    title: 'Vybes',
    description: "Bridging Culture & Opportunity — connect artists, recruiters, and culture lovers.",
    url: baseUrl,
    siteName: 'Vybes',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vybes',
    description: "Bridging Culture & Opportunity — connect artists, recruiters, and culture lovers.",
  },
}

export default function Page() {
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Vybes',
    url: baseUrl,
  }

  const webSiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Vybes',
    url: baseUrl,
  }

  return (
    <>
      <Script id="ld-org" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(orgJsonLd)}
      </Script>
      <Script id="ld-website" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(webSiteJsonLd)}
      </Script>
      <LandingPageClient />
    </>
  )
}


