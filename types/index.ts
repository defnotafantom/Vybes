/**
 * Centralized TypeScript types for the Vybes application
 */

// ============================================
// USER TYPES
// ============================================

export type UserRole = 'DEFAULT' | 'ARTIST' | 'RECRUITER' | 'ARTIST_RECRUITER'

export interface User {
  id: string
  email: string
  emailVerified?: Date | null
  name: string | null
  username: string | null
  image: string | null
  role: UserRole
  bio?: string | null
  location?: string | null
  website?: string | null
  level: number
  experience: number
  reputation: number
  coins: number
  useAvatar: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UserProfile extends User {
  _count?: {
    followers: number
    following: number
    posts: number
    portfolio: number
  }
  isFollowing?: boolean
}

export interface UserBasic {
  id: string
  name: string | null
  username: string | null
  image: string | null
  role?: UserRole | string | null
}

// ============================================
// POST TYPES
// ============================================

export type PostType = 'POST' | 'COLLABORATION' | 'EVENT' | 'ANNOUNCEMENT'

export interface Post {
  id: string
  content: string
  images: string[]
  tags: string[]
  type: PostType
  location?: string | null
  latitude?: number | null
  longitude?: number | null
  author: UserBasic
  authorId: string
  createdAt: Date | string
  updatedAt: Date | string
  likes: number
  comments: number
  liked: boolean
  saved: boolean
}

export interface PostWithDetails extends Post {
  commentsData?: Comment[]
  collaborationArtists?: UserBasic[]
}

export interface CreatePostData {
  content: string
  images?: string[]
  tags?: string[]
  type?: PostType
  location?: string
  latitude?: number
  longitude?: number
  collaborationArtists?: string[]
}

// ============================================
// COMMENT TYPES
// ============================================

export interface Comment {
  id: string
  content: string
  postId: string
  authorId: string
  author: UserBasic
  createdAt: Date | string
  updatedAt: Date | string
}

// ============================================
// EVENT TYPES
// ============================================

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export interface Event {
  id: string
  title: string
  description: string
  type: string
  status: EventStatus
  address: string
  city: string
  country: string
  latitude: number
  longitude: number
  startDate: Date | string
  endDate?: Date | string | null
  imageUrl?: string | null
  requirements?: string | null
  compensation?: string | null
  maxParticipants?: number | null
  recruiter: UserBasic
  recruiterId: string
  createdAt: Date | string
  updatedAt: Date | string
  _count?: {
    participants: number
    savedBy: number
  }
  isParticipating?: boolean
  isSaved?: boolean
  participationStatus?: string
}

export interface EventParticipant {
  id: string
  eventId: string
  userId: string
  user: UserBasic
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  createdAt: Date | string
}

export interface CreateEventData {
  title: string
  description: string
  type: string
  address: string
  city: string
  country: string
  latitude: number
  longitude: number
  startDate: string | Date
  endDate?: string | Date
  imageUrl?: string
  requirements?: string
  compensation?: string
  maxParticipants?: number
  status?: EventStatus
}

// ============================================
// MESSAGE TYPES
// ============================================

export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ'

export interface Message {
  id: string
  conversationId: string
  senderId: string
  sender: UserBasic
  recipientId: string
  recipient: UserBasic
  content: string
  status: MessageStatus
  createdAt: Date | string
}

export interface Conversation {
  id: string
  participants: ConversationParticipant[]
  messages: Message[]
  lastMessage?: Message
  createdAt: Date | string
  updatedAt: Date | string
  unreadCount?: number
}

export interface ConversationParticipant {
  id: string
  conversationId: string
  userId: string
  user: UserBasic
  lastReadAt?: Date | string | null
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType = 'message' | 'follow' | 'comment' | 'like' | 'event' | 'quest'

export interface Notification {
  id: string
  userId: string
  type: NotificationType | string
  title: string
  content: string
  link?: string | null
  read: boolean
  createdAt: Date | string
}

// ============================================
// PORTFOLIO TYPES
// ============================================

export interface PortfolioItem {
  id: string
  userId: string
  title: string
  description?: string | null
  imageUrl?: string | null
  videoUrl?: string | null
  tags: string[]
  type: string
  createdAt: Date | string
  updatedAt: Date | string
}

// ============================================
// QUEST TYPES
// ============================================

export interface Quest {
  id: string
  title: string
  description: string
  type: string
  role: UserRole[]
  experienceReward: number
  reputationReward: number
  createdAt: Date | string
  updatedAt: Date | string
}

export interface QuestProgress {
  id: string
  questId: string
  quest: Quest
  userId: string
  progress: number
  maxProgress: number
  completed: boolean
  completedAt?: Date | string | null
}

// ============================================
// AVATAR TYPES
// ============================================

export interface Avatar {
  id: string
  userId: string
  face?: string | null
  eyes?: string | null
  hair?: string | null
  top?: string | null
  bottom?: string | null
  accessories?: string | null
  createdAt: Date | string
  updatedAt: Date | string
}

export interface AvatarItem {
  id: string
  name: string
  description?: string | null
  category: 'face' | 'eyes' | 'hair' | 'top' | 'bottom' | 'accessory'
  previewUrl?: string | null
  modelUrl?: string | null
  priceCoins: number
  priceReal?: number | null
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  available: boolean
  createdAt: Date | string
  updatedAt: Date | string
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

export interface PostsResponse {
  posts: Post[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

export interface EventsResponse {
  events: Event[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

// ============================================
// FORM TYPES
// ============================================

export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  name: string
  email: string
  password: string
  role?: UserRole
}

export interface ProfileUpdateData {
  name?: string
  username?: string
  bio?: string
  location?: string
  website?: string
  image?: string
}

// ============================================
// UTILITY TYPES
// ============================================

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

