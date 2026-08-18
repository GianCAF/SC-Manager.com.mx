import { expect, test } from '@playwright/test'
import { consultantProfile, getMockSession, mockProfileRequest } from './authMock'

test('redirige al login cuando el panel no tiene una sesión', async ({ page }) => {
  await page.goto('/consultor')
  await expect(page).toHaveURL(/\/auth\/login$/)
  await expect(page.getByRole('heading', { name: 'Acceso al sistema' })).toBeVisible()
})

test('inicia sesión y carga el perfil activo desde Supabase', async ({ page }) => {
  await mockProfileRequest(page)
  await page.route('**/auth/v1/token?grant_type=password', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(getMockSession()) })
  })

  await page.goto('/auth/login')
  await page.getByLabel('Correo electrónico').fill(consultantProfile.email)
  await page.getByLabel('Contraseña', { exact: true }).fill('contraseña-de-prueba')
  await page.getByRole('button', { name: 'Iniciar sesión' }).click()

  await expect(page).toHaveURL(/\/consultor$/)
  await expect(page.getByText(consultantProfile.full_name, { exact: true })).toBeVisible()
})

test('muestra un mensaje claro cuando las credenciales son incorrectas', async ({ page }) => {
  await page.route('**/auth/v1/token?grant_type=password', async (route) => {
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ code: 'invalid_credentials', message: 'Invalid login credentials' }),
    })
  })

  await page.goto('/auth/login')
  await page.getByLabel('Correo electrónico').fill('incorrecto@example.com')
  await page.getByLabel('Contraseña', { exact: true }).fill('incorrecta')
  await page.getByRole('button', { name: 'Iniciar sesión' }).click()

  await expect(page.getByRole('alert')).toContainText('Correo o contraseña incorrectos.')
  await expect(page).toHaveURL(/\/auth\/login$/)
})
