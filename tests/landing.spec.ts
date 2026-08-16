import { expect, test } from '@playwright/test'

const viewports = [
  { name: 'desktop-1440x900', width: 1440, height: 900 },
  { name: 'laptop-1280x720', width: 1280, height: 720 },
  { name: 'tablet-768x1024', width: 768, height: 1024 },
  { name: 'mobile-390x844', width: 390, height: 844 },
]

for (const viewport of viewports) {
  test(`${viewport.name} renders without overflow or missing imagery`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: 'Tu aliado en confianza y capital humano.' })).toBeVisible()
    await expect(page.locator('header')).toHaveCSS('position', 'sticky')

    await page.evaluate(async () => {
      const step = Math.max(window.innerHeight, 600)
      for (let position = 0; position < document.documentElement.scrollHeight; position += step) {
        window.scrollTo(0, position)
        await new Promise((resolve) => window.setTimeout(resolve, 80))
      }
      window.scrollTo(0, document.documentElement.scrollHeight)
    })
    await page.waitForFunction(() => Array.from(document.images).every((image) => image.complete))

    const imageFailures = await page.locator('img').evaluateAll((images) =>
      images.filter((image) => image.naturalWidth === 0).map((image) => image.getAttribute('src')),
    )
    expect(imageFailures).toEqual([])

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow).toBeLessThanOrEqual(0)

    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(200)
    await page.screenshot({ path: `.validation/${viewport.name}.png`, fullPage: true })
  })
}

test('anchors, sticky header, carousel and placeholder login work', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  const slides = page.locator('#inicio > img')
  await expect(slides).toHaveCount(4)
  await expect(slides.nth(0)).toHaveCSS('opacity', '1')
  await expect.poll(async () => slides.nth(1).evaluate((element) => getComputedStyle(element).opacity), { timeout: 7000 }).toBe('1')

  await page.locator('a[href="#servicios"]').first().click()
  await expect(page).toHaveURL(/#servicios$/)
  await expect(page.getByRole('heading', { name: 'Nuestros Servicios Especializados' })).toBeInViewport()
  const headerTop = await page.locator('header').evaluate((element) => element.getBoundingClientRect().top)
  expect(Math.abs(headerTop)).toBeLessThanOrEqual(1)

  await page.getByRole('link', { name: 'Iniciar Sesión' }).click()
  await expect(page).toHaveURL(/\/auth\/login$/)
  await expect(page.getByRole('heading', { name: 'Acceso al sistema' })).toBeVisible()
})
