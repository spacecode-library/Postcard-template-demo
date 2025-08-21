import { useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1025991919840-lls7npkbgskqor0frtvn8249bgi9bd39.apps.googleusercontent.com'

export const useGoogleSignIn = () => {
  const { googleLogin } = useAuth()

  useEffect(() => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      })
    }
  }, [])

  const handleCredentialResponse = useCallback(async (response) => {
    try {
      await googleLogin(response.credential)
    } catch (error) {
      console.error('Google sign-in error:', error)
    }
  }, [googleLogin])

  const renderGoogleButton = useCallback((elementId) => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.renderButton(
        document.getElementById(elementId),
        {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          shape: 'rectangular',
          width: '100%',
          text: 'continue_with',
          logo_alignment: 'left'
        }
      )
    }
  }, [])

  const triggerGoogleSignIn = useCallback(() => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt()
    }
  }, [])

  return {
    renderGoogleButton,
    triggerGoogleSignIn,
  }
}