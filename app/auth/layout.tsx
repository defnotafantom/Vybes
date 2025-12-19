import type { Metadata } from 'next'

const baseUrl = process.env.NEXTAUTH_URL || 'https://vybeshub.art'

export const metadata: Metadata = {
  title: 'Auth',
  description: 'Sign in or create an account on Vybes.',
  alternates: {
    canonical: `${baseUrl}/auth`,
  },
  openGraph: {
    type: 'website',
    title: 'Auth · Vybes',
    description: 'Sign in or create an account on Vybes.',
    url: `${baseUrl}/auth`,
    siteName: 'Vybes',
  },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children
}








