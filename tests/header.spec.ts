import { expect, test } from '@playwright/test'

test('header updates the expansive indicator with the visible section', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  const navigation = page.getByRole('navigation', { name: 'Navegación principal' })
  const homeLink = navigation.getByRole('link', { name: 'Inicio' })
  const servicesLink = navigation.getByRole('link', { name: 'Servicios' })
  const contactLink = navigation.getByRole('link', { name: 'Contacto' })

  await expect(homeLink).toHaveAttribute('aria-current', 'page')
  await expect(homeLink).toHaveAttribute('data-active', 'true')

  await servicesLink.click()
  await expect(page).toHaveURL(/#servicios$/)
  await expect(servicesLink).toHaveAttribute('aria-current', 'page')
  await expect(servicesLink).toHaveCSS('color', 'rgb(255, 255, 255)')

  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto'
    window.scrollTo(0, document.documentElement.scrollHeight)
  })
  await expect(contactLink).toHaveAttribute('aria-current', 'page')
  await expect(page.locator('header')).toHaveCSS('position', 'sticky')
})
