import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getDefaultRoute, type AppRole } from './authTypes'
import { useAuth } from './AuthContext'

export function ProtectedRoute({ roles, children }: { roles: AppRole[]; children: ReactNode }) {
  const location = useLocation()
  const { loading, session, profile } = useAuth()

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50" aria-live="polite">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          Validando sesión…
        </div>
      </main>
    )
  }

  if (!session || !profile) {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />
  }

  if (!roles.includes(profile.role)) {
    return <Navigate to={getDefaultRoute(profile.role)} replace />
  }

  return children
}
