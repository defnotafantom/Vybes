import { z } from 'zod'

/**
 * Environment variables validation schema
 * Validates all required and optional env vars at runtime
 */

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // NextAuth
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required'),
  NEXTAUTH_URL: z.string().url().optional(),
  
  // Email (optional for development)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  
  // Vercel Blob Storage (optional)
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
  
  // Mapillary (optional)
  NEXT_PUBLIC_MAPILLARY_TOKEN: z.string().optional(),
  
  // App config
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

export type Env = z.infer<typeof envSchema>

/**
 * Validate environment variables
 * Call this at app startup to ensure all required vars are set
 */
export function validateEnv(): Env {
  const result = envSchema.safeParse(process.env)
  
  if (!result.success) {
    console.error('❌ Invalid environment variables:')
    result.error.issues.forEach((issue) => {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`)
    })
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Invalid environment variables')
    }
    
    // In development, warn but don't crash
    console.warn('⚠️ Continuing in development mode with missing env vars')
  }
  
  return result.data || (process.env as unknown as Env)
}

/**
 * Get a validated env variable (with type safety)
 */
export function getEnv<K extends keyof Env>(key: K): Env[K] {
  const value = process.env[key]
  return value as Env[K]
}

/**
 * Check if we're in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * Check if we're in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

/**
 * Get base URL for the app
 */
export function getBaseUrl(): string {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL.replace(/\/+$/, '')
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return 'http://localhost:3000'
}

/**
 * Check if email is configured
 */
export function isEmailConfigured(): boolean {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD
  )
}

/**
 * Check if blob storage is configured
 */
export function isBlobStorageConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN
}



