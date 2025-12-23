import { NextResponse } from 'next/server'

/**
 * API endpoint per verificare quali provider OAuth sono configurati
 * Utile per mostrare/nascondere i bottoni OAuth nel frontend
 */
export async function GET() {
  const providers = {
    google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  }

  return NextResponse.json(providers)
}

