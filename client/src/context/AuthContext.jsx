
import { createContext, useContext, useEffect, useState } from 'react'
import { clearAuthSession, fetchCurrentUser, getStoredAuthSession, getStoredAuthSessionStorage, storeAuthSession } from '../lib/auth.js'

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
        const storedAuthLocation = getStoredAuthSessionStorage()

        if (isMounted) {
          storeAuthSession(
            { token: storedAuth.token, user },
            { persistent: storedAuthLocation !== 'session' }
          )
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

  function completeLogin(authSession, rememberMe = true) {
    const normalizedAuthSession = normalizeAuthSession(authSession)

    if (!normalizedAuthSession) {
      return
    }

    storeAuthSession(normalizedAuthSession, { persistent: rememberMe })
    setCurrentUser(normalizedAuthSession.user)
  }

  async function refreshCurrentUser() {
    const storedAuth = getStoredAuthSession()
    const storedAuthLocation = getStoredAuthSessionStorage()

    if (!storedAuth?.token) {
      return
    }

    const { user } = await fetchCurrentUser(storedAuth.token)
    storeAuthSession(
      { token: storedAuth.token, user },
      { persistent: storedAuthLocation !== 'session' }
    )
    setCurrentUser(user)
  }

  function updateCurrentUser(nextUser) {
    const storedAuth = getStoredAuthSession()
    const storedAuthLocation = getStoredAuthSessionStorage()

    if (!storedAuth?.token || !nextUser) {
      return
    }

    storeAuthSession(
      { token: storedAuth.token, user: nextUser },
      { persistent: storedAuthLocation !== 'session' }
    )
    setCurrentUser(nextUser)
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
        refreshCurrentUser,
        updateCurrentUser,
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
