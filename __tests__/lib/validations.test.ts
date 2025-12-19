import {
  registerSchema,
  loginSchema,
  createPostSchema,
  createEventSchema,
  updateProfileSchema,
  validateData,
} from '@/lib/validations'

describe('Validation Schemas', () => {
  describe('registerSchema', () => {
    it('validates correct registration data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        role: 'ARTIST' as const,
      }
      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects short name', () => {
      const invalidData = {
        name: 'J',
        email: 'john@example.com',
        password: 'Password123',
      }
      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects invalid email', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'not-an-email',
        password: 'Password123',
      }
      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects weak password - no uppercase', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      }
      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects weak password - no lowercase', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'PASSWORD123',
      }
      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects weak password - no number', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'PasswordABC',
      }
      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects short password', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Pass1',
      }
      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('loginSchema', () => {
    it('validates correct login data', () => {
      const validData = {
        email: 'john@example.com',
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
        email: 'john@example.com',
        password: '',
      }
      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('createPostSchema', () => {
    it('validates minimal post data', () => {
      const validData = {
        content: 'Hello world!',
      }
      const result = createPostSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('validates full post data', () => {
      const validData = {
        content: 'Hello world!',
        images: ['https://example.com/image.jpg'],
        tags: ['art', 'music'],
        type: 'POST' as const,
      }
      const result = createPostSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects empty content', () => {
      const invalidData = {
        content: '',
      }
      const result = createPostSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects too long content', () => {
      const invalidData = {
        content: 'a'.repeat(5001),
      }
      const result = createPostSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects too many tags', () => {
      const invalidData = {
        content: 'Hello',
        tags: Array(11).fill('tag'),
      }
      const result = createPostSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('createEventSchema', () => {
    it('validates correct event data', () => {
      const validData = {
        title: 'Music Festival',
        description: 'A great music festival event',
        type: 'EVENT',
        address: '123 Main St',
        city: 'Rome',
        country: 'Italy',
        latitude: 41.9028,
        longitude: 12.4964,
        startDate: '2024-06-01T10:00:00Z',
      }
      const result = createEventSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects short title', () => {
      const invalidData = {
        title: 'Hi',
        description: 'A great music festival event',
        type: 'EVENT',
        address: '123 Main St',
        city: 'Rome',
        country: 'Italy',
        latitude: 41.9028,
        longitude: 12.4964,
        startDate: '2024-06-01T10:00:00Z',
      }
      const result = createEventSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects short description', () => {
      const invalidData = {
        title: 'Music Festival',
        description: 'Short',
        type: 'EVENT',
        address: '123 Main St',
        city: 'Rome',
        country: 'Italy',
        latitude: 41.9028,
        longitude: 12.4964,
        startDate: '2024-06-01T10:00:00Z',
      }
      const result = createEventSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('updateProfileSchema', () => {
    it('validates partial update', () => {
      const validData = {
        name: 'Jane Doe',
      }
      const result = updateProfileSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('validates full update', () => {
      const validData = {
        name: 'Jane Doe',
        username: 'janedoe',
        bio: 'Artist and musician',
        location: 'New York',
        website: 'https://janedoe.com',
      }
      const result = updateProfileSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects invalid username with spaces', () => {
      const invalidData = {
        username: 'jane doe',
      }
      const result = updateProfileSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects invalid website URL', () => {
      const invalidData = {
        website: 'not-a-url',
      }
      const result = updateProfileSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('allows empty website', () => {
      const validData = {
        website: '',
      }
      const result = updateProfileSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('validateData helper', () => {
    it('returns success with data for valid input', () => {
      const result = validateData(loginSchema, {
        email: 'test@example.com',
        password: 'password',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('test@example.com')
      }
    })

    it('returns error message for invalid input', () => {
      const result = validateData(loginSchema, {
        email: '',
        password: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeTruthy()
      }
    })
  })
})





