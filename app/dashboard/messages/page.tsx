"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Send, Search, ArrowLeft, MessageSquare } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { formatDistanceToNow } from 'date-fns'
import { it } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useMinichat } from '@/components/chat/minichat-provider'

interface Conversation {
  id: string
  participant: {
    id: string
    name: string | null
    image: string | null
    username: string | null
  }
  lastMessage: {
    content: string
    createdAt: Date
  } | null
  unreadCount: number
}

interface Message {
  id: string
  content: string
  senderId: string
  createdAt: Date
}

export default function MessagesPage() {
  const { data: session } = useSession()
  const { openChat } = useMinichat()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation)
      
      // Set up polling for new messages (Socket.io will replace this)
      const interval = setInterval(() => {
        fetchMessages(selectedConversation)
        fetchConversations()
      }, 3000) // Poll every 3 seconds

      return () => clearInterval(interval)
    }
  }, [selectedConversation])

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId: string) => {
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    try {
      const response = await fetch(`/api/messages/${selectedConversation}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
      })

      if (response.ok) {
        setNewMessage('')
        fetchMessages(selectedConversation)
        fetchConversations()
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const selectedConversationData = conversations.find(c => c.id === selectedConversation)

  if (loading) {
    return <div className="text-center py-12">Caricamento messaggi...</div>
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-4">
      {/* Conversations List */}
      <Card className={cn(
        "w-full md:w-80 flex flex-col bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-sky-100 dark:border-sky-900 shadow-xl",
        selectedConversation && "hidden md:flex"
      )}>
        <div className="p-4 border-b border-sky-200 dark:border-sky-800 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/30 dark:to-blue-900/30">
          <h2 className="text-xl font-black bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Messaggi
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Cerca conversazioni..." 
              className="pl-10 border-2 border-sky-200 dark:border-sky-800 bg-white dark:bg-gray-900 focus:border-sky-500 dark:focus:border-sky-500 rounded-xl" 
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">
              Nessuna conversazione ✨
            </div>
          ) : (
            <div>
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`w-full p-4 border-b border-sky-100 dark:border-sky-900 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-all duration-200 text-left ${
                    selectedConversation === conversation.id 
                      ? 'bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/30 dark:to-blue-900/30 border-l-4 border-sky-500' 
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="ring-2 ring-sky-200 dark:ring-sky-800">
                      <AvatarImage src={conversation.participant.image || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-sky-500 to-blue-600 text-white font-semibold">
                        {conversation.participant.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate text-slate-800 dark:text-slate-100">
                        {conversation.participant.name || conversation.participant.username || 'Utente'}
                      </div>
                      {conversation.lastMessage && (
                        <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
                          {conversation.lastMessage.content}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {conversation.unreadCount > 0 && (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/30">
                          {conversation.unreadCount}
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openChat(conversation.id, conversation.participant)
                        }}
                        className="p-2 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-900/20 transition-colors"
                        title="Apri minichat"
                      >
                        <MessageSquare className="h-4 w-4 text-sky-500" />
                      </button>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Chat Area */}
      <Card className={cn(
        "flex-1 flex flex-col bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-sky-100 dark:border-sky-900 shadow-xl",
        !selectedConversation && "hidden md:flex"
      )}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-sky-200 dark:border-sky-800 flex items-center gap-3 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/30 dark:to-blue-900/30">
              <button
                onClick={() => setSelectedConversation(null)}
                className="md:hidden p-2 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-900/20 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              </button>
              <Avatar className="ring-2 ring-sky-200 dark:ring-sky-800">
                <AvatarImage src={selectedConversationData?.participant.image || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-sky-500 to-blue-600 text-white font-semibold">
                  {selectedConversationData?.participant.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-100">
                  {selectedConversationData?.participant.name || selectedConversationData?.participant.username || 'Utente'}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-sky-50/50 to-transparent dark:from-sky-950/50">
              {messages.map((message) => {
                const isOwn = message.senderId === session?.user?.id
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl p-4 shadow-lg transition-all hover:scale-[1.02] ${
                        isOwn
                          ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white'
                          : 'bg-white dark:bg-gray-800 border-2 border-sky-100 dark:border-sky-900 text-slate-800 dark:text-slate-100'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <p className={`text-xs mt-2 ${
                        isOwn ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        {formatDistanceToNow(new Date(message.createdAt), {
                          addSuffix: true,
                          locale: it,
                        })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-sky-200 dark:border-sky-800 flex gap-2 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/30 dark:to-blue-900/30">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Scrivi un messaggio..."
                className="flex-1 border-2 border-sky-200 dark:border-sky-800 bg-white dark:bg-gray-900 focus:border-sky-500 dark:focus:border-sky-500 rounded-xl"
              />
              <Button 
                type="submit" 
                disabled={!newMessage.trim()}
                className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg shadow-sky-500/30"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 dark:text-slate-400">
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <p className="text-lg font-medium">Seleziona una conversazione</p>
              <p className="text-sm mt-2">per iniziare a chattare</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

