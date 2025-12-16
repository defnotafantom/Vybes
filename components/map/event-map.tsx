"use client"

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface Event {
  id: string
  title: string
  description: string
  latitude: number
  longitude: number
  startDate: string
  type: string
  recruiter: {
    name: string | null
  }
}

interface EventMapProps {
  events: Event[]
  onEventClick: (event: Event) => void
  onMapClick?: (lat: number, lng: number) => void
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap()
  
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
  
  return null
}

function MapClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  const map = useMap()

  useEffect(() => {
    if (!onMapClick) return

    const handleClick = (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng)
    }

    map.on('click', handleClick)
    return () => {
      map.off('click', handleClick)
    }
  }, [map, onMapClick])

  return null
}

export default function EventMap({ events, onEventClick, onMapClick }: EventMapProps) {
  const mapRef = useRef<L.Map>(null)
  
  // Default center (Italy)
  const defaultCenter: [number, number] = [41.9028, 12.4964]
  
  // Calculate center from events or use default
  const center = events.length > 0
    ? [
        events.reduce((sum, e) => sum + e.latitude, 0) / events.length,
        events.reduce((sum, e) => sum + e.longitude, 0) / events.length,
      ] as [number, number]
    : defaultCenter

  const createCustomIcon = (type: string) => {
    const colors: Record<string, string> = {
      EVENT: '#9333ea',
      JOB: '#3b82f6',
      COLLABORATION: '#10b981',
      TRAINING: '#f59e0b',
      event: '#9333ea',
      job: '#3b82f6',
      collaboration: '#10b981',
      training: '#f59e0b',
    }
    
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: ${colors[type] || '#9333ea'}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    })
  }

  return (
    <MapContainer
      center={center}
      zoom={6}
      style={{ height: '100%', width: '100%' }}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController center={center} />
      {onMapClick && <MapClickHandler onMapClick={onMapClick} />}
      {events.map((event) => (
        <Marker
          key={event.id}
          position={[event.latitude, event.longitude]}
          icon={createCustomIcon(event.type)}
          eventHandlers={{
            click: () => onEventClick(event),
          }}
        >
          <Popup>
            <div>
              <h3 className="font-bold">{event.title}</h3>
              <p className="text-sm text-gray-600">{event.type}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(event.startDate).toLocaleDateString('it-IT')}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

