
import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'


const AuthLayout = () => {
  useEffect(() => {
    const root = document.getElementById('root')
    if (root) {
      root.style.height = '100%'
    }
    return () => {
      if (root) {
        root.style.height = 'auto'
      }
    }
  }, [])

  return (
    <Outlet />
  )
}

export { AuthLayout }
