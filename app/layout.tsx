import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { LanguageProvider } from '@/components/providers/language-provider'
import { SessionProvider } from '@/components/session-provider'
import { Toaster } from '@/components/ui/toaster'
import { PWAProvider } from '@/components/pwa/pwa-provider'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: '#0ea5e9',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: {
    default: 'Vybes',
    template: '%s · Vybes',
  },
  description: "Bridging Culture & Opportunity — connect artists, recruiters, and culture lovers.",
  applicationName: 'Vybes',
  keywords: ['vybes', 'artists', 'recruiters', 'events', 'collaborations', 'culture', 'art'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Vybes',
  },
  openGraph: {
    type: 'website',
    siteName: 'Vybes',
    title: 'Vybes',
    description: "Bridging Culture & Opportunity — connect artists, recruiters, and culture lovers.",
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vybes',
    description: "Bridging Culture & Opportunity — connect artists, recruiters, and culture lovers.",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <LanguageProvider>
              <PWAProvider>
                {children}
                <Toaster />
                <Analytics />
                <SpeedInsights />
              </PWAProvider>
            </LanguageProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}

