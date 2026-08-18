import type { Session } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { isSupabaseConfigured, supabase } from '../../lib/supabase'
import type { AppProfile } from './authTypes'

type AuthState = {
  session: Session | null
  profile: AppProfile | null
  loading: boolean
  error: string | null
}

type AuthContextValue = AuthState & {
  signIn: (email: string, password: string) => Promise<AppProfile>
  signOut: () => Promise<void>
}

const initialState: AuthState = {
  session: null,
  profile: null,
  loading: true,
  error: null,
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function getProfile(userId: string): Promise<AppProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, full_name, email, status, last_sign_in_at')
    .eq('id', userId)
    .single()

  if (error || !data) {
    throw new Error('Tu usuario no tiene un perfil activo en SC Manager.')
  }

  return data as AppProfile
}

function validateProfile(profile: AppProfile) {
  if (profile.status === 'blocked') {
    throw new Error('Tu cuenta está bloqueada. Comunícate con un administrador.')
  }

  if (profile.status !== 'active') {
    throw new Error('Tu cuenta todavía no ha sido activada por un administrador.')
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState)

  useEffect(() => {
    let mounted = true

    const applySession = async (session: Session | null) => {
      if (!mounted) return

      if (!session) {
        setState({ session: null, profile: null, loading: false, error: null })
        return
      }

      try {
        const profile = await getProfile(session.user.id)
        validateProfile(profile)
        if (mounted) setState({ session, profile, loading: false, error: null })
      } catch (error) {
        if (mounted) {
          setState({
            session,
            profile: null,
            loading: false,
            error: error instanceof Error ? error.message : 'No fue posible validar tu perfil.',
          })
        }
      }
    }

    void supabase.auth.getSession().then(({ data }) => applySession(data.session))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => void applySession(session), 0)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    ...state,
    signIn: async (email: string, password: string) => {
      if (!isSupabaseConfigured) {
        throw new Error('La conexión con Supabase no está configurada.')
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (error || !data.session) {
        throw new Error('Correo o contraseña incorrectos.')
      }

      try {
        const profile = await getProfile(data.user.id)
        validateProfile(profile)
        setState({ session: data.session, profile, loading: false, error: null })
        return profile
      } catch (profileError) {
        await supabase.auth.signOut({ scope: 'local' })
        throw profileError
      }
    },
    signOut: async () => {
      await supabase.auth.signOut({ scope: 'local' })
      setState({ session: null, profile: null, loading: false, error: null })
    },
  }), [state])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe utilizarse dentro de AuthProvider.')
  return context
}
