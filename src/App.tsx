import { Navigate, Route, Routes } from 'react-router-dom'
import { CandidatePortal } from './features/candidate/CandidatePortal'
import { LoginPage } from './features/auth/LoginPage'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { ConsultantWorkspace } from './features/consultant/ConsultantWorkspace'
import { LandingPage } from './features/landing/LandingPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/admin" element={<Navigate to="/consultor" replace />} />
      <Route path="/consultor" element={(
        <ProtectedRoute roles={['admin', 'consultant']}>
          <ConsultantWorkspace />
        </ProtectedRoute>
      )} />
      <Route path="/cliente" element={(
        <ProtectedRoute roles={['candidate']}>
          <CandidatePortal />
        </ProtectedRoute>
      )} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
