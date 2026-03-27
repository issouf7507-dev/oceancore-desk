import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AuthProvider, } from '@/modules/auth'
import { AppRoutes } from '@/routing/AppRoutes'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>

      <AppRoutes />
      {/* </AuthInit> */}
    </AuthProvider>
  </StrictMode>,
)
