import { Navigate, Route, Routes } from 'react-router-dom'
import { LandingPage } from './features/landing/LandingPage'
import { LoginPlaceholder } from './features/landing/LoginPlaceholder'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/login" element={<LoginPlaceholder />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
