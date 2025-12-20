import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('should load landing page', async ({ page }) => {
    await page.goto('/')
    
    // Check logo and title
    await expect(page.locator('text=Vybes')).toBeVisible()
    
    // Check CTA button
    const ctaButton = page.getByRole('link', { name: /let.*s go|andiamo/i })
    await expect(ctaButton).toBeVisible()
  })

  test('should navigate to auth page', async ({ page }) => {
    await page.goto('/')
    
    const ctaButton = page.getByRole('link', { name: /let.*s go|andiamo/i })
    await ctaButton.click()
    
    await expect(page).toHaveURL(/\/auth/)
  })

  test('should toggle theme', async ({ page }) => {
    await page.goto('/')
    
    // Find theme toggle button
    const themeButton = page.getByRole('button', { name: /theme|tema/i })
    
    if (await themeButton.isVisible()) {
      await themeButton.click()
      // Check that html class changes
      await expect(page.locator('html')).toHaveClass(/dark|light/)
    }
  })

  test('should be responsive', async ({ page }) => {
    await page.goto('/')
    
    // Mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('text=Vybes')).toBeVisible()
    
    // Tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('text=Vybes')).toBeVisible()
    
    // Desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page.locator('text=Vybes')).toBeVisible()
  })
})





import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('should load landing page', async ({ page }) => {
    await page.goto('/')
    
    // Check logo and title
    await expect(page.locator('text=Vybes')).toBeVisible()
    
    // Check CTA button
    const ctaButton = page.getByRole('link', { name: /let.*s go|andiamo/i })
    await expect(ctaButton).toBeVisible()
  })

  test('should navigate to auth page', async ({ page }) => {
    await page.goto('/')
    
    const ctaButton = page.getByRole('link', { name: /let.*s go|andiamo/i })
    await ctaButton.click()
    
    await expect(page).toHaveURL(/\/auth/)
  })

  test('should toggle theme', async ({ page }) => {
    await page.goto('/')
    
    // Find theme toggle button
    const themeButton = page.getByRole('button', { name: /theme|tema/i })
    
    if (await themeButton.isVisible()) {
      await themeButton.click()
      // Check that html class changes
      await expect(page.locator('html')).toHaveClass(/dark|light/)
    }
  })

  test('should be responsive', async ({ page }) => {
    await page.goto('/')
    
    // Mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('text=Vybes')).toBeVisible()
    
    // Tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('text=Vybes')).toBeVisible()
    
    // Desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page.locator('text=Vybes')).toBeVisible()
  })
})






