import { expect, test } from '@playwright/test'
import { authenticateAsConsultant } from './authMock'

test.beforeEach(async ({ page }) => {
  await authenticateAsConsultant(page)
  await page.goto('/consultor')
})

test('organiza los formularios y conserva el expediente activo en la caché', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Apertura del expediente' })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Formularios del estudio' }).getByRole('button')).toHaveCount(23)

  await page.getByRole('button', { name: /Datos personales/ }).click()
  await page.getByLabel('Nombre del candidato').fill('Candidato de prueba')
  await page.getByLabel(/^Fecha de nacimiento/).fill('2000-01-01')
  await page.getByLabel('Lugar de nacimiento').fill('Pachuca, Hidalgo')
  await page.getByLabel('Correo electrónico').fill('candidato@example.com')
  await page.getByLabel('Nacionalidad').fill('Mexicana')
  await page.getByLabel('Estado civil').selectOption('Soltero(a)')
  await page.getByLabel('CURP').fill('HECA000101HHGRRN01')
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

test('impide guardar formularios con campos obligatorios vacíos', async ({ page }) => {
  await page.getByRole('button', { name: /Datos personales/ }).click()
  await expect(page.getByLabel('Nombre del candidato')).toHaveAttribute('required', '')
  await expect(page.getByLabel(/^Fecha de nacimiento/)).toHaveAttribute('required', '')
  await expect(page.getByLabel('Lugar de nacimiento')).toHaveAttribute('required', '')
  await expect(page.getByLabel('Correo electrónico')).toHaveAttribute('required', '')
  await expect(page.getByLabel('CURP')).toHaveAttribute('required', '')
  await expect(page.getByLabel('Nacionalidad')).toHaveAttribute('required', '')
  await expect(page.getByLabel('Estado civil')).toHaveAttribute('required', '')

  await page.getByRole('button', { name: 'Guardar formulario' }).click()
  await expect(page.getByLabel('Nombre del candidato')).toBeFocused()

  await page.getByRole('button', { name: /Domicilio/ }).click()
  for (const label of ['Calle y número', 'Colonia', 'Código postal', 'Delegación o municipio', 'Estado', 'Teléfono móvil']) {
    await expect(page.getByLabel(label).first()).toHaveAttribute('required', '')
  }

  await page.getByRole('button', { name: /Resultado general/ }).click()
  await expect(page.getByLabel('Resultado')).toHaveAttribute('required', '')

  await page.getByRole('button', { name: /Ingresos/ }).click()
  await expect(page.getByLabel('Ingreso bruto mensual')).toHaveAttribute('required', '')
})

test('registra un único enlace de Drive y los documentos entregados', async ({ page }) => {
  await page.getByRole('button', { name: /Documentación/ }).click()

  await expect(page.getByText('Carpeta de documentos del cliente')).toBeVisible()
  await expect(page.locator('input[type="url"]')).toHaveCount(1)
  await expect(page.getByLabel(/URL de/)).toHaveCount(0)

  await page.getByLabel('Enlace de la carpeta de Google Drive').fill('https://drive.google.com/drive/folders/candidato-demo')
  await page.getByRole('checkbox', { name: 'Acta de nacimiento', exact: true }).check()
  await page.getByLabel('INE o pasaporte').check()
  await page.getByRole('button', { name: 'Guardar formulario' }).click()
  await page.reload()
  await page.getByRole('button', { name: /Documentación/ }).click()

  await expect(page.getByLabel('Enlace de la carpeta de Google Drive')).toHaveValue('https://drive.google.com/drive/folders/candidato-demo')
  await expect(page.getByRole('checkbox', { name: 'Acta de nacimiento', exact: true })).toBeChecked()
  await expect(page.getByLabel('INE o pasaporte')).toBeChecked()
})

test('permite indicar que el candidato continúa en su empleo actual', async ({ page }) => {
  await page.getByRole('button', { name: /Trayectoria laboral/ }).click()
  const endDate = page.getByLabel('Fecha de salida')
  const currentJob = page.getByLabel('Trabajo aquí actualmente')

  await endDate.fill('2026-09-02')
  await currentJob.check()
  await expect(endDate).toHaveValue('')
  await expect(endDate).toBeDisabled()

  await currentJob.uncheck()
  await expect(endDate).toBeEnabled()
})

test('alterna entre registro y búsqueda y carga un expediente existente', async ({ page }) => {
  await expect(page.getByText('Borrador local protegido')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Registro' })).toHaveAttribute('aria-current', 'page')

  await page.route('**/rest/v1/**', async (route) => {
    const url = new URL(route.request().url())
    const table = url.pathname.split('/').at(-1)
    const expectsObject = route.request().headers().accept?.includes('application/vnd.pgrst.object+json')
    let body: unknown = expectsObject ? null : []

    if (table === 'candidates' && url.searchParams.has('full_name')) {
      body = [{ id: 'candidate-1', full_name: 'María López Hernández', email: 'maria@example.com' }]
    } else if (table === 'candidates' && url.searchParams.has('id')) {
      body = {
        id: 'candidate-1',
        full_name: 'María López Hernández',
        email: 'maria@example.com',
        birth_date: '1994-04-18',
        birth_place: 'Pachuca, Hidalgo',
        nationality: 'Mexicana',
        marital_status: 'Soltero(a)',
        curp: 'LOHM940418MHGPRR01',
      }
    } else if (table === 'study_candidates') {
      body = url.searchParams.get('select') === 'candidate_id'
        ? { candidate_id: 'candidate-1' }
        : [{ study_id: 'study-1', candidate_id: 'candidate-1' }]
    } else if (table === 'studies' && url.searchParams.get('id')?.startsWith('in.')) {
      body = [{ id: 'study-1', folio: 'SC-2026-0001', job_position: 'Analista', client_company_id: 'company-1', status_id: 'status-1', created_at: '2026-08-15T12:00:00Z', updated_at: '2026-09-01T12:00:00Z' }]
    } else if (table === 'studies') {
      body = { id: 'study-1', folio: 'SC-2026-0001', job_position: 'Analista', client_company_id: 'company-1', status_id: 'status-1', created_at: '2026-08-15T12:00:00Z', updated_at: '2026-09-01T12:00:00Z' }
    } else if (table === 'client_companies' && expectsObject) {
      body = { legal_name: 'Empresa Demo', trade_name: 'Empresa Demo' }
    } else if (table === 'client_companies') {
      body = [{ id: 'company-1', legal_name: 'Empresa Demo', trade_name: 'Empresa Demo' }]
    } else if (table === 'study_statuses') {
      body = [{ id: 'status-1', label: 'Borrador' }]
    }

    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
  })

  await page.getByRole('button', { name: 'Buscar cliente' }).click()
  await expect(page.getByRole('heading', { name: 'Buscar cliente' })).toBeVisible()
  await page.getByRole('searchbox', { name: 'Buscar por nombre del cliente' }).fill('María')
  await expect(page.getByRole('heading', { name: 'María López Hernández' })).toBeVisible()
  await page.getByRole('button', { name: /Abrir expediente/ }).click()

  await expect(page.getByText('María López Hernández', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: /Datos personales/ }).click()
  const candidateName = page.getByLabel('Nombre del candidato')
  await expect(candidateName).toHaveValue('María López Hernández')
  await candidateName.fill('María López Actualizada')
  const floatingSave = page.getByRole('button', { name: 'Actualizar cambios' })
  await expect(floatingSave).toBeVisible()
  await floatingSave.click()
  await expect(page.getByText('Cambios guardados en Supabase')).toBeVisible()
  await expect(floatingSave).toBeEnabled()
  await expect(page.getByRole('button', { name: 'Guardar cambios' })).toBeEnabled()

  const reportCheckboxes = page.locator('input[aria-label^="Incluir "]')
  await expect(reportCheckboxes).toHaveCount(23)
  await expect(page.locator('input[aria-label^="Incluir "]:checked')).toHaveCount(0)
  await page.getByRole('button', { name: 'Seleccionar todos' }).click()
  await expect(page.locator('input[aria-label^="Incluir "]:checked')).toHaveCount(23)
  await expect(page.getByText('Reporte de estudio socioeconómico')).toBeVisible()
  await expect(page.getByText('Fecha de creación del expediente: 15 de agosto de 2026')).toBeVisible()

  await page.evaluate(() => {
    window.print = () => { document.body.dataset.printFilename = document.title }
  })
  await page.getByRole('button', { name: 'Imprimir PDF' }).click()
  await expect(page.locator('body')).toHaveAttribute('data-print-filename', 'Expediente_María_López_Actualizada')
})
