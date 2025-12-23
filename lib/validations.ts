import { z } from 'zod'

// ============================================
// AUTH SCHEMAS
// ============================================

export const registerSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve avere almeno 2 caratteri')
    .max(50, 'Nome troppo lungo'),
  email: z.string()
    .email('Email non valida')
    .max(100, 'Email troppo lunga'),
  password: z.string()
    .min(8, 'Password deve avere almeno 8 caratteri')
    .max(100, 'Password troppo lunga')
    .regex(/[A-Z]/, 'Password deve contenere almeno una lettera maiuscola')
    .regex(/[a-z]/, 'Password deve contenere almeno una lettera minuscola')
    .regex(/[0-9]/, 'Password deve contenere almeno un numero'),
  role: z.enum(['DEFAULT', 'ARTIST', 'RECRUITER', 'ARTIST_RECRUITER']).optional().default('DEFAULT'),
})

export const loginSchema = z.object({
  email: z.string().min(1, 'Username richiesto'), // Il campo si chiama "email" ma accetta username
  password: z.string().min(1, 'Password richiesta'),
})

export const forgotPasswordSchema = z.object({
  identifier: z.string().min(3, 'Inserisci username'),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token richiesto'),
  password: z.string()
    .min(8, 'Password deve avere almeno 8 caratteri')
    .max(100, 'Password troppo lunga'),
})

// ============================================
// POST SCHEMAS
// ============================================

export const createPostSchema = z.object({
  content: z.string()
    .min(1, 'Contenuto richiesto')
    .max(5000, 'Contenuto troppo lungo'),
  images: z.array(z.string().url()).optional().default([]),
  tags: z.array(z.string().max(30)).max(10).optional().default([]),
  type: z.enum(['POST', 'COLLABORATION', 'EVENT', 'ANNOUNCEMENT']).optional().default('POST'),
  collaborationArtists: z.array(z.string()).optional(),
  location: z.string().max(200).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

export const updatePostSchema = createPostSchema.partial()

export const commentSchema = z.object({
  content: z.string()
    .min(1, 'Commento richiesto')
    .max(1000, 'Commento troppo lungo'),
})

// ============================================
// EVENT SCHEMAS
// ============================================

export const createEventSchema = z.object({
  title: z.string()
    .min(3, 'Titolo deve avere almeno 3 caratteri')
    .max(100, 'Titolo troppo lungo'),
  description: z.string()
    .min(10, 'Descrizione deve avere almeno 10 caratteri')
    .max(5000, 'Descrizione troppo lunga'),
  type: z.string().min(1, 'Tipo richiesto'),
  address: z.string().min(1, 'Indirizzo richiesto'),
  city: z.string().min(1, 'Città richiesta'),
  country: z.string().min(1, 'Paese richiesto'),
  latitude: z.number(),
  longitude: z.number(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()).optional(),
  imageUrl: z.string().url().optional().nullable(),
  requirements: z.string().max(2000).optional(),
  compensation: z.string().max(500).optional(),
  maxParticipants: z.number().int().positive().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
})

export const updateEventSchema = createEventSchema.partial()

// ============================================
// USER/PROFILE SCHEMAS
// ============================================

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username può contenere solo lettere, numeri e underscore').optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional().or(z.literal('')),
  image: z.string().url().optional().nullable(),
})

// ============================================
// PORTFOLIO SCHEMAS
// ============================================

export const createPortfolioItemSchema = z.object({
  title: z.string()
    .min(1, 'Titolo richiesto')
    .max(100, 'Titolo troppo lungo'),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().url().optional().nullable(),
  videoUrl: z.string().url().optional().nullable(),
  tags: z.array(z.string().max(30)).max(10).optional().default([]),
  type: z.string().min(1, 'Tipo richiesto'),
})

// ============================================
// MESSAGE SCHEMAS
// ============================================

export const sendMessageSchema = z.object({
  content: z.string()
    .min(1, 'Messaggio richiesto')
    .max(2000, 'Messaggio troppo lungo'),
  recipientId: z.string().optional(),
})

export const createConversationSchema = z.object({
  participantId: z.string().min(1, 'Partecipante richiesto'),
  initialMessage: z.string().max(2000).optional(),
})

// ============================================
// SEARCH SCHEMA
// ============================================

export const searchSchema = z.object({
  q: z.string().min(1).max(100),
  type: z.enum(['all', 'users', 'posts', 'events']).optional().default('all'),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(50).optional().default(20),
})

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Validate data against a Zod schema and return formatted error
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data)
  
  if (!result.success) {
    const firstError = result.error.errors[0]
    return {
      success: false,
      error: firstError?.message || 'Dati non validi',
    }
  }
  
  return { success: true, data: result.data }
}

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type CreatePostInput = z.infer<typeof createPostSchema>
export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type CreatePortfolioItemInput = z.infer<typeof createPortfolioItemSchema>
export type SendMessageInput = z.infer<typeof sendMessageSchema>







