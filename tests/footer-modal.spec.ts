import { expect, test } from '@playwright/test'

test('contact content is a footer and opens an accessible modal', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  const footer = page.locator('footer#contacto')
  await expect(footer).toHaveCount(1)
  await expect(page.locator('section#contacto')).toHaveCount(0)
  await expect(footer.getByText('Dirección')).toBeVisible()
  await expect(footer.getByText('Redes sociales')).toBeVisible()

  const privacyLink = footer.getByRole('link', { name: 'Avisos de privacidad' })
  await expect(privacyLink).toHaveAttribute('href', '/documentos/aviso-de-privacidad-integral.pdf')
  await expect(privacyLink).toHaveAttribute('download', 'Aviso-de-Privacidad-Integral-SocioManager.pdf')

  const privacyPdf = await page.request.get('/documentos/aviso-de-privacidad-integral.pdf')
  expect(privacyPdf.ok()).toBeTruthy()
  expect(privacyPdf.headers()['content-type']).toContain('application/pdf')
  const privacyPdfBody = await privacyPdf.body()
  expect(privacyPdfBody.subarray(0, 4).toString()).toBe('%PDF')
  expect(privacyPdfBody.byteLength).toBeGreaterThan(50_000)

  await footer.getByRole('button', { name: /completa nuestro formulario/i }).click()

  const dialog = page.getByRole('dialog', { name: 'Completa nuestro formulario' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByPlaceholder('Tu nombre')).toBeFocused()
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden')

  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
})
