import { test, expect } from '@playwright/test';

test('Sovereignty Smoke Test - Application Root Visibility', async ({ page }) => {
  await page.goto('/');
  const rootElement = page.locator('main').first();
  await expect(rootElement).toBeVisible();
  await expect(page).toHaveTitle(/NicePod/i);
});

test('Sovereignty Administrative Protection - Redirect to Login', async ({ page }) => {
  // Validamos que las rutas administrativas están protegidas
  // El middleware debe redirigir a /login
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login/);
});
