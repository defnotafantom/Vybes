"use client"

import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Initialize socket connection
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
      path: '/api/socket',
      transports: ['websocket'],
    })

    socket.on('connect', () => {
      console.log('✅ Socket connected')
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected')
      setIsConnected(false)
    })

    return () => {
      if (socket) {
        socket.disconnect()
        socket = null
      }
    }
  }, [])

  return { socket, isConnected }
}

export function getSocket() {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
      path: '/api/socket',
      transports: ['websocket'],
    })
  }
  return socket
}

