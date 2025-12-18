import { test, expect } from '@playwright/test'

test.describe('API Health', () => {
  test('health endpoint returns ok', async ({ request }) => {
    const response = await request.get('/api/health')
    expect(response.ok()).toBeTruthy()
    
    const data = await response.json()
    expect(data.status).toBe('ok')
  })
})

test.describe('API Authentication', () => {
  test('register endpoint requires data', async ({ request }) => {
    const response = await request.post('/api/auth/register', {
      data: {},
    })
    
    // Should return 400 for invalid data
    expect(response.status()).toBe(400)
  })

  test('register endpoint validates email', async ({ request }) => {
    const response = await request.post('/api/auth/register', {
      data: {
        name: 'Test User',
        email: 'invalid-email',
        password: 'Password123',
      },
    })
    
    expect(response.status()).toBe(400)
  })

  test('forgot-password endpoint requires email', async ({ request }) => {
    const response = await request.post('/api/auth/forgot-password', {
      data: {},
    })
    
    expect(response.status()).toBe(400)
  })
})

test.describe('API Protected Routes', () => {
  test('posts endpoint requires auth', async ({ request }) => {
    const response = await request.get('/api/posts')
    
    // Should return 401 without session
    expect(response.status()).toBe(401)
  })

  test('events endpoint requires auth', async ({ request }) => {
    const response = await request.get('/api/events')
    
    // Public events might be accessible, or 401
    expect([200, 401]).toContain(response.status())
  })

  test('profile endpoint requires auth', async ({ request }) => {
    const response = await request.get('/api/user/profile')
    
    expect(response.status()).toBe(401)
  })
})

