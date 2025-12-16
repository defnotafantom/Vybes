"use client"

import { createContext, useContext, useState, ReactNode } from 'react'
import { Minichat } from './minichat'
import { useSession } from 'next-auth/react'

interface MinichatContextType {
  openChat: (conversationId: string, recipient: { id: string; name: string | null; image: string | null }) => void
  closeChat: () => void
}

const MinichatContext = createContext<MinichatContextType | undefined>(undefined)

export function useMinichat() {
  const context = useContext(MinichatContext)
  if (!context) {
    throw new Error('useMinichat must be used within MinichatProvider')
  }
  return context
}

export function MinichatProvider({ children }: { children: ReactNode }) {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [recipient, setRecipient] = useState<{ id: string; name: string | null; image: string | null } | null>(null)

  const openChat = (convId: string, rec: { id: string; name: string | null; image: string | null }) => {
    setConversationId(convId)
    setRecipient(rec)
  }

  const closeChat = () => {
    setConversationId(null)
    setRecipient(null)
  }

  // Auto-refresh conversations count (called from minichat)
  // This could be enhanced with polling or socket.io in the future

  return (
    <MinichatContext.Provider value={{ openChat, closeChat }}>
      {children}
      {/* Always render Minichat, it will handle its own visibility */}
      <Minichat conversationId={conversationId} recipient={recipient} />
    </MinichatContext.Provider>
  )
}

