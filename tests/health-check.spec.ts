/**
 * ARCHIVO: tests/health-check.spec.ts
 * VERSIÓN: 6.0 (Madrid Resonance - Pro Edition)
 * PROTOCOLO: VISION INFRASTRUCTURE VALIDATION
 * MISIÓN: Verificación de disponibilidad y renderizado de la plataforma
 * NIVEL DE INTEGRIDAD: 100% (Soberano)
 */

import { test, expect } from '@playwright/test';

test('has title containing NicePod', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page).toHaveTitle(/NicePod/i);
});
