/* eslint-disable react-refresh/only-export-components */
import { type FC, useEffect, useState, createContext, useContext, type Dispatch, type SetStateAction } from 'react'
import * as authHelper from './AuthHelpers'



type AuthContextProps = {
  auth: any | undefined
  saveAuth: (auth: any | undefined) => void
  currentUser: any | undefined
  setCurrentUser: Dispatch<SetStateAction<any | undefined>>
  logout: () => void
}

const initAuthContextPropsState = {
  auth: authHelper.getAuth(),
  saveAuth: () => { },
  currentUser: undefined,
  setCurrentUser: () => { },
  logout: () => { },
}

const AuthContext = createContext<AuthContextProps>(initAuthContextPropsState)

const useAuth = () => {
  return useContext(AuthContext)
}

const AuthProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialAuth = authHelper.getAuth()
  const [auth, setAuth] = useState<any | undefined>(initialAuth)
  const [currentUser, setCurrentUser] = useState<any | undefined>(initialAuth?.user)
  const saveAuth = (auth: any | undefined) => {
    setAuth(auth)
    if (auth) {
      authHelper.setAuth(auth)
    } else {
      authHelper.removeAuth()
    }
  }

  const logout = () => {
    saveAuth(undefined)
    setCurrentUser(undefined)
  }

  return (
    <AuthContext.Provider value={{ auth, saveAuth, currentUser, setCurrentUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

const AuthInit: FC<{ children: React.ReactNode }> = ({ children }) => {
  const { auth, currentUser, logout, setCurrentUser } = useAuth()
  const [showSplashScreen, setShowSplashScreen] = useState(true)

  useEffect(() => {
    const run = async () => {
      try {
        // No /me endpoint in backend: hydrate user from localStorage.
        if (auth?.api_token) {
          if (!currentUser && auth?.user) {
            setCurrentUser(auth.user)
          }
        } else {
          logout()
        }
      } catch (e) {
        console.error(e)
        logout()
      } finally {
        setShowSplashScreen(false)
      }
    }

    void run()
    // Intentionally run once on mount; auth is read from localStorage on first render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return showSplashScreen ? <div>Loading...</div> : <>{children}</>
}


export { AuthProvider, AuthInit, useAuth }
