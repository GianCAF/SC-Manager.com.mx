export type AppRole = 'admin' | 'consultant' | 'candidate'

export type ProfileStatus = 'pending' | 'active' | 'blocked'

export type AppProfile = {
  id: string
  role: AppRole
  full_name: string
  email: string
  status: ProfileStatus
  last_sign_in_at: string | null
}

export function getDefaultRoute(role: AppRole): string {
  return role === 'candidate' ? '/cliente' : '/consultor'
}
