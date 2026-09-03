import type { Page } from '@playwright/test'

export const testUserId = '11111111-1111-4111-8111-111111111111'

export const consultantProfile = {
  id: testUserId,
  role: 'consultant',
  full_name: 'Consultor de prueba',
  email: 'consultor@example.com',
  status: 'active',
  last_sign_in_at: new Date().toISOString(),
}

function createSession() {
  const expiresAt = Math.floor(Date.now() / 1000) + 3600
  const payload = Buffer.from(JSON.stringify({
    aud: 'authenticated',
    exp: expiresAt,
    sub: testUserId,
    email: consultantProfile.email,
    role: 'authenticated',
  })).toString('base64url')

  return {
    access_token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${payload}.test-signature`,
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: expiresAt,
    refresh_token: 'test-refresh-token',
    user: {
      id: testUserId,
      aud: 'authenticated',
      role: 'authenticated',
      email: consultantProfile.email,
      email_confirmed_at: new Date().toISOString(),
      app_metadata: { provider: 'email', providers: ['email'] },
      user_metadata: {},
      identities: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  }
}

export async function mockProfileRequest(page: Page) {
  await page.route('**/rest/v1/profiles*', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(consultantProfile) })
  })
}

export async function authenticateAsConsultant(page: Page) {
  await mockProfileRequest(page)
  await page.addInitScript(({ storageKey, session }) => {
    window.localStorage.setItem(storageKey, JSON.stringify(session))
  }, {
    storageKey: 'sb-cahhtyoxlvnqevhxftpr-auth-token',
    session: createSession(),
  })
}

export function getMockSession() {
  return createSession()
}
