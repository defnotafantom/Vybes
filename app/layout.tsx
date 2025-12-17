import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { LanguageProvider } from '@/components/providers/language-provider'
import { SessionProvider } from '@/components/session-provider'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: {
    default: 'Vybes',
    template: '%s · Vybes',
  },
  description: "Bridging Culture & Opportunity — connect artists, recruiters, and culture lovers.",
  applicationName: 'Vybes',
  keywords: ['vybes', 'artists', 'recruiters', 'events', 'collaborations', 'culture', 'art'],
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
              {children}
              <Toaster />
            </LanguageProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}

