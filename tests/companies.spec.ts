import { expect, test } from '@playwright/test'

test('muestra logotipos remotos y enlaza cada empresa', async ({ page }) => {
  await page.goto('/')

  const section = page.getByRole('region', { name: 'Empresas que confían en nosotros' })
  const logos = section.locator('img')

  await section.scrollIntoViewIfNeeded()
  await expect(logos).toHaveCount(5)

  for (let index = 0; index < 5; index += 1) {
    await expect(logos.nth(index)).toHaveAttribute('src', /^https:\/\//)
  }

  await expect.poll(
    () => logos.evaluateAll((images) => images.every((image) => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0)),
    { timeout: 15_000 },
  ).toBe(true)

  await expect(section.getByRole('link')).toHaveCount(5)
})
