"use client"

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { MessageSquare, X, Send, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import { useMinichat } from './minichat-provider'

interface Conversation {
  id: string
  participant: {
    id: string
    name: string | null
    username: string | null
    image: string | null
  }
  lastMessage: {
    content: string
    createdAt: string
  } | null
  unreadCount: number
}

interface MinichatProps {
  conversationId: string | null
  recipient: {
    id: string
    name: string | null
    image: string | null
  } | null
}

export function Minichat({ conversationId, recipient }: MinichatProps) {
  const { data: session } = useSession()
  const { openChat, closeChat } = useMinichat()
  const [isOpen, setIsOpen] = useState(false)
  const [showConversations, setShowConversations] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loadingConversations, setLoadingConversations] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch conversations list
  const fetchConversations = async () => {
    if (!session?.user?.id) return
    setLoadingConversations(true)
    try {
      const response = await fetch('/api/messages/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoadingConversations(false)
    }
  }

  // Auto-open if conversationId and recipient are provided
  useEffect(() => {
    if (conversationId && recipient && !isOpen) {
      setIsOpen(true)
      setShowConversations(false)
    } else if (!conversationId && isOpen && !showConversations) {
      setIsOpen(false)
    }
  }, [conversationId, recipient, isOpen, showConversations])

  // Fetch conversations when opening
  useEffect(() => {
    if (isOpen && !conversationId && showConversations) {
      fetchConversations()
    }
  }, [isOpen, conversationId, showConversations, session])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchMessages = async () => {
    if (!conversationId) return
    try {
      const response = await fetch(`/api/messages/${conversationId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  useEffect(() => {
    if (isOpen && conversationId) {
      fetchMessages()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !conversationId) return

    try {
      const response = await fetch(`/api/messages/${conversationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
      })

      if (response.ok) {
        setNewMessage('')
        fetchMessages()
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  // Always show button - open minichat
  const handleButtonClick = () => {
    setIsOpen(true)
    if (!conversationId) {
      setShowConversations(true)
      fetchConversations()
    }
  }

  const handleConversationClick = (conversation: Conversation) => {
    openChat(conversation.id, {
      id: conversation.participant.id,
      name: conversation.participant.name,
      image: conversation.participant.image,
    })
    setShowConversations(false)
  }

  const handleCloseChat = () => {
    setIsOpen(false)
    setShowConversations(false)
    closeChat()
  }

  // Refresh conversations count periodically
  useEffect(() => {
    if (!isOpen) {
      const interval = setInterval(() => {
        fetchConversations()
      }, 30000) // Every 30 seconds
      return () => clearInterval(interval)
    }
  }, [isOpen, session])

  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          onClick={handleButtonClick}
          className="fixed bottom-4 right-4 h-14 w-14 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30 hover:from-sky-600 hover:to-blue-700 flex items-center justify-center z-[100] transition-all hover:scale-110"
          title="Apri chat rapida"
        >
          <MessageSquare className="h-6 w-6" />
          {conversations.some(c => c.unreadCount > 0) && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white font-bold">
              {conversations.reduce((sum, c) => sum + c.unreadCount, 0)}
            </span>
          )}
        </motion.button>
      )}

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 right-4 w-80 h-[500px] z-[100]"
        >
          <Card className="w-full h-full shadow-2xl flex flex-col bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-2 border-sky-200 dark:border-sky-800">
            {showConversations ? (
              // Conversations List View
              <>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-sky-200 dark:border-sky-800">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-sky-500" />
                    <span className="font-semibold text-slate-800 dark:text-slate-100">Chat Rapide</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-sky-100 dark:hover:bg-sky-900/30"
                    onClick={handleCloseChat}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                  <div className="flex-1 overflow-y-auto">
                    {loadingConversations ? (
                      <div className="flex items-center justify-center py-8 text-slate-500 dark:text-slate-400">
                        Caricamento...
                      </div>
                    ) : conversations.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm px-4">
                        Nessuna conversazione. Inizia una chat dalla pagina Messaggi!
                      </div>
                    ) : (
                      <div className="divide-y divide-sky-200 dark:divide-sky-800">
                        {conversations.map((conversation) => (
                          <button
                            key={conversation.id}
                            onClick={() => handleConversationClick(conversation)}
                            className="w-full p-3 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors text-left"
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={conversation.participant.image || undefined} />
                                  <AvatarFallback className="bg-gradient-to-br from-sky-500 to-blue-600 text-white text-sm">
                                    {conversation.participant.name?.charAt(0).toUpperCase() || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                {conversation.unreadCount > 0 && (
                                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white font-bold">
                                    {conversation.unreadCount}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">
                                  {conversation.participant.name || conversation.participant.username || 'Utente'}
                                </div>
                                {conversation.lastMessage && (
                                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                    {conversation.lastMessage.content}
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </>
            ) : conversationId && recipient ? (
              // Active Chat View
              <>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-sky-200 dark:border-sky-800">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={recipient.image || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-sky-500 to-blue-600 text-white text-xs">
                        {recipient.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                      {recipient.name || 'Utente'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-sky-100 dark:hover:bg-sky-900/30"
                      onClick={() => {
                        setShowConversations(true)
                        closeChat()
                      }}
                      title="Lista conversazioni"
                    >
                      <Users className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-sky-100 dark:hover:bg-sky-900/30"
                      onClick={handleCloseChat}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {messages.map((message) => {
                      const isOwn = message.senderId === session?.user?.id
                      return (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-xl p-3 text-sm shadow-md ${
                              isOwn
                                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-br-none'
                                : 'bg-sky-50 dark:bg-sky-900/20 text-slate-800 dark:text-slate-200 rounded-bl-none'
                            }`}
                          >
                            {message.content}
                          </div>
                        </motion.div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                  <form
                    onSubmit={handleSendMessage}
                    className="border-t border-sky-200 dark:border-sky-800 p-2 flex gap-2 bg-white/90 dark:bg-gray-800/90"
                  >
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Scrivi un messaggio..."
                      className="flex-1 bg-sky-50/50 dark:bg-sky-900/20 backdrop-blur-sm border-sky-200 dark:border-sky-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 text-sm h-9"
                    />
                    <Button 
                      type="submit" 
                      size="icon" 
                      className="h-9 w-9 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-md shadow-sky-500/30"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </>
            ) : null}
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
