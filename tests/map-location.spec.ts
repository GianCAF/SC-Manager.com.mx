import { expect, test } from '@playwright/test'

test('map is a standalone section after trusted companies and has no anchor', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  const locationSection = page.locator('section[aria-label="Empresas que confían en nosotros"] + section[aria-label="Ubicación de la empresa"]')

  await expect(locationSection).toHaveCount(1)
  await expect(locationSection).not.toHaveAttribute('id')
  await expect(locationSection.locator('iframe[title="Ubicación de la Empresa"]')).toHaveCount(1)
  await expect(page.locator('#contacto iframe')).toHaveCount(0)
})
