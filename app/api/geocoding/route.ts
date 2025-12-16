import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] })
    }

    // Use Nominatim (OpenStreetMap) for geocoding - free and no API key required
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'ArtPlatform/1.0', // Required by Nominatim
        },
      }
    )

    if (!response.ok) {
      return NextResponse.json({ results: [] })
    }

    const data = await response.json()

    const results = data.map((item: any) => ({
      display_name: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      address: item.address || {},
      city: item.address?.city || item.address?.town || item.address?.village || item.address?.municipality || '',
      country: item.address?.country || '',
    }))

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Geocoding error:', error)
    return NextResponse.json({ results: [] }, { status: 500 })
  }
}

