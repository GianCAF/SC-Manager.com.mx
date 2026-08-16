import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/consultor')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('organiza los formularios y conserva el expediente activo en la caché', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Apertura del expediente' })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Formularios del estudio' }).getByRole('button')).toHaveCount(23)

  await page.getByRole('button', { name: /Datos personales/ }).click()
  await page.getByLabel('Nombre del candidato').fill('Candidato de prueba')
  await page.getByLabel('Fecha de nacimiento', { exact: true }).fill('2000-01-01')
  await expect(page.getByRole('spinbutton', { name: /Edad/ })).toHaveValue('26')
  await page.getByRole('button', { name: 'Guardar formulario' }).click()

  await page.reload()
  await expect(page.getByText('Candidato de prueba', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: /Datos personales/ }).click()
  await expect(page.getByLabel('Nombre del candidato')).toHaveValue('Candidato de prueba')
})

test('calcula ingresos, egresos y autocompleta el domicilio sin bloquear la edición', async ({ page }) => {
  await page.route('https://postali.app/api/v1/mx/cp/42000', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        estado: 'Hidalgo',
        municipio: 'Pachuca de Soto',
        asentamientos: [{ nombre: 'Centro' }, { nombre: 'Periodistas' }],
      }),
    })
  })

  await page.getByRole('button', { name: /Domicilio/ }).click()
  await page.getByLabel('Código postal').fill('42000')
  await page.getByRole('button', { name: 'Autocompletar domicilio' }).click()
  await expect(page.getByLabel('Estado')).toHaveValue('Hidalgo')
  await expect(page.getByLabel('Delegación o municipio')).toHaveValue('Pachuca de Soto')
  await expect(page.getByLabel('Colonia').first()).toHaveValue('Centro')
  await page.getByLabel('Estado').fill('Hidalgo editado')
  await expect(page.getByLabel('Estado')).toHaveValue('Hidalgo editado')

  await page.getByRole('button', { name: /Egresos/ }).click()
  await page.getByLabel('Renta mensual').fill('1000')
  await page.getByLabel('Alimentos').fill('500')
  await expect(page.getByText('$1,500.00')).toBeVisible()

  await page.getByRole('button', { name: /Ingresos/ }).click()
  await page.getByLabel('Ingreso bruto mensual').fill('10000')
  await page.getByLabel('Otros ingresos').fill('2500')
  await expect(page.getByText('$12,500.00')).toBeVisible()
})

test('inicia los registros repetibles con uno y permite agregar más', async ({ page }) => {
  await page.getByRole('button', { name: /Referencias/ }).click()
  await expect(page.getByText('Referencia 1', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Agregar referencia' }).click()
  await expect(page.getByText('Referencia 2', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: /Visitas/ }).click()
  await expect(page.getByText('Visita 1', { exact: true })).toBeVisible()
  await expect(page.getByLabel('URLs de fotografías 1')).toHaveAttribute('placeholder', 'https://imagedelivery.net/...')
})
