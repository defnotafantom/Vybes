import { rateLimit, getClientIP, rateLimitConfigs } from '@/lib/rate-limit'

describe('Rate Limiter', () => {
  beforeEach(() => {
    // Clear any existing rate limit entries by waiting or using unique identifiers
  })

  describe('rateLimit', () => {
    it('allows requests under the limit', () => {
      const identifier = `test-${Date.now()}-1`
      const options = { limit: 5, windowSeconds: 60 }

      const result1 = rateLimit(identifier, options)
      expect(result1.success).toBe(true)
      expect(result1.remaining).toBe(4)

      const result2 = rateLimit(identifier, options)
      expect(result2.success).toBe(true)
      expect(result2.remaining).toBe(3)
    })

    it('blocks requests at the limit', () => {
      const identifier = `test-${Date.now()}-2`
      const options = { limit: 2, windowSeconds: 60 }

      rateLimit(identifier, options) // 1
      rateLimit(identifier, options) // 2

      const result = rateLimit(identifier, options) // 3 - should be blocked
      expect(result.success).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('returns correct resetTime', () => {
      const identifier = `test-${Date.now()}-3`
      const options = { limit: 5, windowSeconds: 60 }
      const before = Date.now()

      const result = rateLimit(identifier, options)
      
      expect(result.resetTime).toBeGreaterThan(before)
      expect(result.resetTime).toBeLessThanOrEqual(before + 60000 + 100) // Allow 100ms tolerance
    })

    it('uses different counters for different identifiers', () => {
      const identifier1 = `test-${Date.now()}-4a`
      const identifier2 = `test-${Date.now()}-4b`
      const options = { limit: 2, windowSeconds: 60 }

      rateLimit(identifier1, options)
      rateLimit(identifier1, options)
      const result1 = rateLimit(identifier1, options)
      expect(result1.success).toBe(false)

      const result2 = rateLimit(identifier2, options)
      expect(result2.success).toBe(true)
      expect(result2.remaining).toBe(1)
    })
  })

  describe('getClientIP', () => {
    // Mock request with headers
    const createMockRequest = (headers: Record<string, string> = {}) => ({
      headers: {
        get: (name: string) => headers[name.toLowerCase()] || null,
      },
    } as unknown as Request)

    it('extracts IP from x-forwarded-for header', () => {
      const request = createMockRequest({
        'x-forwarded-for': '192.168.1.1, 10.0.0.1',
      })
      expect(getClientIP(request)).toBe('192.168.1.1')
    })

    it('extracts IP from x-real-ip header', () => {
      const request = createMockRequest({
        'x-real-ip': '192.168.1.2',
      })
      expect(getClientIP(request)).toBe('192.168.1.2')
    })

    it('returns unknown when no IP headers', () => {
      const request = createMockRequest({})
      expect(getClientIP(request)).toBe('unknown')
    })

    it('prefers x-forwarded-for over x-real-ip', () => {
      const request = createMockRequest({
        'x-forwarded-for': '192.168.1.1',
        'x-real-ip': '192.168.1.2',
      })
      expect(getClientIP(request)).toBe('192.168.1.1')
    })
  })

  describe('rateLimitConfigs', () => {
    it('has correct register config', () => {
      expect(rateLimitConfigs.register.limit).toBe(5)
      expect(rateLimitConfigs.register.windowSeconds).toBe(3600)
    })

    it('has correct login config', () => {
      expect(rateLimitConfigs.login.limit).toBe(10)
      expect(rateLimitConfigs.login.windowSeconds).toBe(900)
    })

    it('has correct forgotPassword config', () => {
      expect(rateLimitConfigs.forgotPassword.limit).toBe(3)
      expect(rateLimitConfigs.forgotPassword.windowSeconds).toBe(3600)
    })

    it('has correct api config', () => {
      expect(rateLimitConfigs.api.limit).toBe(100)
      expect(rateLimitConfigs.api.windowSeconds).toBe(60)
    })
  })
})

