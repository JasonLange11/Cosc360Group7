import { createContext, useContext, useEffect, useState } from 'react'
import { clearAuthSession, fetchCurrentUser, getStoredAuthSession, storeAuthSession } from '../lib/auth.js'

const AuthContext = createContext(null)

function normalizeAuthSession(authSession) {
  if (authSession?.token) {
    return authSession
  }

  if (authSession?.user?.token) {
    return authSession.user
  }

  return null
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function restoreAuthSession() {
      const storedAuth = getStoredAuthSession()

      if (!storedAuth?.token) {
        if (storedAuth) {
          clearAuthSession()
        }

        if (isMounted) {
          setAuthReady(true)
        }

        return
      }

      try {
        const { user } = await fetchCurrentUser(storedAuth.token)

        if (isMounted) {
          storeAuthSession({ token: storedAuth.token, user })
          setCurrentUser(user)
        }
      } catch {
        clearAuthSession()

        if (isMounted) {
          setCurrentUser(null)
        }
      } finally {
        if (isMounted) {
          setAuthReady(true)
        }
      }
    }

    restoreAuthSession()

    return () => {
      isMounted = false
    }
  }, [])

  function completeLogin(authSession) {
    const normalizedAuthSession = normalizeAuthSession(authSession)

    if (!normalizedAuthSession) {
      return
    }

    storeAuthSession(normalizedAuthSession)
    setCurrentUser(normalizedAuthSession.user)
  }

  function logout() {
    clearAuthSession()
    setCurrentUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        authReady,
        currentUser,
        isAuthenticated: Boolean(currentUser),
        completeLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}