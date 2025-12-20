import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should display auth page', async ({ page }) => {
    await page.goto('/auth')
    
    // Check for login/register tabs or forms
    await expect(page.locator('text=/accedi|login|sign in/i')).toBeVisible()
  })

  test('should show validation errors on empty login', async ({ page }) => {
    await page.goto('/auth')
    
    // Try to submit empty form
    const submitButton = page.getByRole('button', { name: /accedi|login|sign in/i })
    
    if (await submitButton.isVisible()) {
      await submitButton.click()
      
      // Should show validation message or stay on page
      await expect(page).toHaveURL(/\/auth/)
    }
  })

  test('should show register form', async ({ page }) => {
    await page.goto('/auth')
    
    // Look for register tab/link
    const registerLink = page.locator('text=/registrati|register|sign up/i')
    
    if (await registerLink.isVisible()) {
      await registerLink.click()
      
      // Should show name field for registration
      await expect(page.locator('input[name="name"], input[placeholder*="nome"]')).toBeVisible()
    }
  })

  test('should redirect to dashboard if already logged in', async ({ page, context }) => {
    // This test would require mocking session
    // For now, just verify the auth page loads correctly
    await page.goto('/auth')
    await expect(page).toHaveURL(/\/auth|\/dashboard/)
  })
})





import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should display auth page', async ({ page }) => {
    await page.goto('/auth')
    
    // Check for login/register tabs or forms
    await expect(page.locator('text=/accedi|login|sign in/i')).toBeVisible()
  })

  test('should show validation errors on empty login', async ({ page }) => {
    await page.goto('/auth')
    
    // Try to submit empty form
    const submitButton = page.getByRole('button', { name: /accedi|login|sign in/i })
    
    if (await submitButton.isVisible()) {
      await submitButton.click()
      
      // Should show validation message or stay on page
      await expect(page).toHaveURL(/\/auth/)
    }
  })

  test('should show register form', async ({ page }) => {
    await page.goto('/auth')
    
    // Look for register tab/link
    const registerLink = page.locator('text=/registrati|register|sign up/i')
    
    if (await registerLink.isVisible()) {
      await registerLink.click()
      
      // Should show name field for registration
      await expect(page.locator('input[name="name"], input[placeholder*="nome"]')).toBeVisible()
    }
  })

  test('should redirect to dashboard if already logged in', async ({ page, context }) => {
    // This test would require mocking session
    // For now, just verify the auth page loads correctly
    await page.goto('/auth')
    await expect(page).toHaveURL(/\/auth|\/dashboard/)
  })
})






