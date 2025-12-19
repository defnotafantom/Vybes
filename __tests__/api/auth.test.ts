/**
 * Unit tests for auth API utilities
 * Note: Full API route testing is done in e2e tests
 */

import { registerSchema, loginSchema } from '@/lib/validations'

describe('Auth API Validation', () => {
  describe('registerSchema', () => {
    it('validates correct registration data', () => {
      const validData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
        role: 'ARTIST',
      }

      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects short password', () => {
      const invalidData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'short',
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects password without uppercase', () => {
      const invalidData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects password without number', () => {
      const invalidData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'PasswordNoNumber',
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects invalid email', () => {
      const invalidData = {
        name: 'Test User',
        email: 'not-an-email',
        password: 'Password123',
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects short name', () => {
      const invalidData = {
        name: 'A',
        email: 'test@example.com',
        password: 'Password123',
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('uses DEFAULT role if not specified', () => {
      const data = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
      }

      const result = registerSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.role).toBe('DEFAULT')
      }
    })
  })

  describe('loginSchema', () => {
    it('validates correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'anypassword',
      }

      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects empty email', () => {
      const invalidData = {
        email: '',
        password: 'password',
      }

      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
      }

      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})



