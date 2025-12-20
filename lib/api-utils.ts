import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ZodSchema } from 'zod'

// ============================================
// RESPONSE HELPERS
// ============================================

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status })
}

export function errorResponse(
  error: string,
  status = 500,
  details?: string
) {
  const response: { error: string; details?: string } = { error }
  if (details && process.env.NODE_ENV === 'development') {
    response.details = details
  }
  return NextResponse.json(response, { status })
}

export function unauthorizedResponse(message = 'Non autorizzato') {
  return errorResponse(message, 401)
}

export function forbiddenResponse(message = 'Accesso negato') {
  return errorResponse(message, 403)
}

export function notFoundResponse(message = 'Non trovato') {
  return errorResponse(message, 404)
}

export function badRequestResponse(message = 'Richiesta non valida') {
  return errorResponse(message, 400)
}

export function validationErrorResponse(message: string) {
  return errorResponse(message, 400)
}

// ============================================
// AUTH HELPERS
// ============================================

export async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions)
  return session?.user ?? null
}

export async function requireAuth() {
  const user = await getAuthenticatedUser()
  if (!user?.id) {
    throw new AuthError('Non autorizzato')
  }
  return user
}

export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role as string)) {
    throw new ForbiddenError('Non hai i permessi per questa azione')
  }
  return user
}

// ============================================
// REQUEST HELPERS
// ============================================

export async function parseJsonBody<T>(request: Request): Promise<T> {
  try {
    return await request.json()
  } catch {
    throw new ValidationError('Body JSON non valido')
  }
}

export function parseQueryParams(request: Request) {
  const { searchParams } = new URL(request.url)
  return searchParams
}

export function getPaginationParams(request: Request) {
  const params = parseQueryParams(request)
  const page = Math.max(1, parseInt(params.get('page') || '1'))
  const limit = Math.min(100, Math.max(1, parseInt(params.get('limit') || '20')))
  const skip = (page - 1) * limit
  
  return { page, limit, skip }
}

// ============================================
// VALIDATION HELPERS
// ============================================

export function validateBody<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    const firstError = result.error.errors[0]
    throw new ValidationError(firstError?.message || 'Dati non validi')
  }
  return result.data
}

// ============================================
// CUSTOM ERRORS
// ============================================

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class AuthError extends ApiError {
  constructor(message = 'Non autorizzato') {
    super(message, 401, 'UNAUTHORIZED')
    this.name = 'AuthError'
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Accesso negato') {
    super(message, 403, 'FORBIDDEN')
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Risorsa non trovata') {
    super(message, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class ValidationError extends ApiError {
  constructor(message = 'Dati non validi') {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

// ============================================
// ERROR HANDLER
// ============================================

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)

  if (error instanceof ApiError) {
    return errorResponse(error.message, error.statusCode)
  }

  if (error instanceof Error) {
    return errorResponse(
      'Errore interno del server',
      500,
      error.message
    )
  }

  return errorResponse('Errore sconosciuto', 500)
}

// ============================================
// API HANDLER WRAPPER
// ============================================

type ApiHandler = (request: Request, context?: any) => Promise<NextResponse>

export function withErrorHandling(handler: ApiHandler): ApiHandler {
  return async (request: Request, context?: any) => {
    try {
      return await handler(request, context)
    } catch (error) {
      return handleApiError(error)
    }
  }
}

export function withAuth(handler: ApiHandler): ApiHandler {
  return withErrorHandling(async (request: Request, context?: any) => {
    await requireAuth()
    return handler(request, context)
  })
}

export function withRole(allowedRoles: string[], handler: ApiHandler): ApiHandler {
  return withErrorHandling(async (request: Request, context?: any) => {
    await requireRole(allowedRoles)
    return handler(request, context)
  })
}

// ============================================
// PAGINATION RESPONSE
// ============================================

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return successResponse({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  })
}





import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ZodSchema } from 'zod'

// ============================================
// RESPONSE HELPERS
// ============================================

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status })
}

export function errorResponse(
  error: string,
  status = 500,
  details?: string
) {
  const response: { error: string; details?: string } = { error }
  if (details && process.env.NODE_ENV === 'development') {
    response.details = details
  }
  return NextResponse.json(response, { status })
}

export function unauthorizedResponse(message = 'Non autorizzato') {
  return errorResponse(message, 401)
}

export function forbiddenResponse(message = 'Accesso negato') {
  return errorResponse(message, 403)
}

export function notFoundResponse(message = 'Non trovato') {
  return errorResponse(message, 404)
}

export function badRequestResponse(message = 'Richiesta non valida') {
  return errorResponse(message, 400)
}

export function validationErrorResponse(message: string) {
  return errorResponse(message, 400)
}

// ============================================
// AUTH HELPERS
// ============================================

export async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions)
  return session?.user ?? null
}

export async function requireAuth() {
  const user = await getAuthenticatedUser()
  if (!user?.id) {
    throw new AuthError('Non autorizzato')
  }
  return user
}

export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role as string)) {
    throw new ForbiddenError('Non hai i permessi per questa azione')
  }
  return user
}

// ============================================
// REQUEST HELPERS
// ============================================

export async function parseJsonBody<T>(request: Request): Promise<T> {
  try {
    return await request.json()
  } catch {
    throw new ValidationError('Body JSON non valido')
  }
}

export function parseQueryParams(request: Request) {
  const { searchParams } = new URL(request.url)
  return searchParams
}

export function getPaginationParams(request: Request) {
  const params = parseQueryParams(request)
  const page = Math.max(1, parseInt(params.get('page') || '1'))
  const limit = Math.min(100, Math.max(1, parseInt(params.get('limit') || '20')))
  const skip = (page - 1) * limit
  
  return { page, limit, skip }
}

// ============================================
// VALIDATION HELPERS
// ============================================

export function validateBody<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    const firstError = result.error.errors[0]
    throw new ValidationError(firstError?.message || 'Dati non validi')
  }
  return result.data
}

// ============================================
// CUSTOM ERRORS
// ============================================

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class AuthError extends ApiError {
  constructor(message = 'Non autorizzato') {
    super(message, 401, 'UNAUTHORIZED')
    this.name = 'AuthError'
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Accesso negato') {
    super(message, 403, 'FORBIDDEN')
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Risorsa non trovata') {
    super(message, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class ValidationError extends ApiError {
  constructor(message = 'Dati non validi') {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

// ============================================
// ERROR HANDLER
// ============================================

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)

  if (error instanceof ApiError) {
    return errorResponse(error.message, error.statusCode)
  }

  if (error instanceof Error) {
    return errorResponse(
      'Errore interno del server',
      500,
      error.message
    )
  }

  return errorResponse('Errore sconosciuto', 500)
}

// ============================================
// API HANDLER WRAPPER
// ============================================

type ApiHandler = (request: Request, context?: any) => Promise<NextResponse>

export function withErrorHandling(handler: ApiHandler): ApiHandler {
  return async (request: Request, context?: any) => {
    try {
      return await handler(request, context)
    } catch (error) {
      return handleApiError(error)
    }
  }
}

export function withAuth(handler: ApiHandler): ApiHandler {
  return withErrorHandling(async (request: Request, context?: any) => {
    await requireAuth()
    return handler(request, context)
  })
}

export function withRole(allowedRoles: string[], handler: ApiHandler): ApiHandler {
  return withErrorHandling(async (request: Request, context?: any) => {
    await requireRole(allowedRoles)
    return handler(request, context)
  })
}

// ============================================
// PAGINATION RESPONSE
// ============================================

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return successResponse({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  })
}






