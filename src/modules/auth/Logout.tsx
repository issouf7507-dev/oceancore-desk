import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './core/Auth'
import { logoutRequest } from "./core/_requests"

export function Logout() {
  const { auth, logout } = useAuth()
  useEffect(() => {
    const run = async () => {
      try {
        if (auth?.api_token) {
          await logoutRequest(auth.api_token)
        }
      } catch (e) {
        console.error(e)
      } finally {
        logout()
      }
    }

    void run()
  }, [auth?.api_token, logout])

  return <Navigate to="/auth" replace />
}
