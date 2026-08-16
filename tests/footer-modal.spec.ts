import { expect, test } from '@playwright/test'

test('contact content is a footer and opens an accessible modal', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  const footer = page.locator('footer#contacto')
  await expect(footer).toHaveCount(1)
  await expect(page.locator('section#contacto')).toHaveCount(0)
  await expect(footer.getByText('Dirección')).toBeVisible()
  await expect(footer.getByText('Redes sociales')).toBeVisible()

  await footer.getByRole('button', { name: /completa nuestro formulario/i }).click()

  const dialog = page.getByRole('dialog', { name: 'Completa nuestro formulario' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByPlaceholder('Tu nombre')).toBeFocused()
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden')

  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
})
