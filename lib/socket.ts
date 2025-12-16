import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'

let io: SocketIOServer | null = null

export function initializeSocket(server: HTTPServer) {
  if (io) return io

  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/api/socket',
  })

  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id)

    // Join user's room
    socket.on('join-user', (userId: string) => {
      socket.join(`user-${userId}`)
      console.log(`👤 User ${userId} joined their room`)
    })

    // Join conversation room
    socket.on('join-conversation', (conversationId: string) => {
      socket.join(`conversation-${conversationId}`)
      console.log(`💬 Joined conversation ${conversationId}`)
    })

    // Leave conversation room
    socket.on('leave-conversation', (conversationId: string) => {
      socket.leave(`conversation-${conversationId}`)
      console.log(`👋 Left conversation ${conversationId}`)
    })

    // Handle new message
    socket.on('send-message', async (data: { conversationId: string; message: any }) => {
      // Broadcast to all users in the conversation
      io?.to(`conversation-${data.conversationId}`).emit('new-message', data.message)
    })

    // Handle typing indicator
    socket.on('typing', (data: { conversationId: string; userId: string; isTyping: boolean }) => {
      socket.to(`conversation-${data.conversationId}`).emit('user-typing', {
        userId: data.userId,
        isTyping: data.isTyping,
      })
    })

    socket.on('disconnect', () => {
      console.log('🔌 Client disconnected:', socket.id)
    })
  })

  return io
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized')
  }
  return io
}

