import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AuthProvider, } from '@/modules/auth'
import { AppRoutes } from '@/routing/AppRoutes'
import { Toaster } from './components/ui/sonner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>

      <AppRoutes />
      {/* </AuthInit> */}
      <Toaster />
    </AuthProvider>
  </StrictMode>,
)
