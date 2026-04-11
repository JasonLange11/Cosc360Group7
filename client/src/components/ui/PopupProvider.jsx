import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import './css/PopupProvider.css'

const PopupContext = createContext(null)

function buildDialog(type, options, resolve) {
  return {
    type,
    title: options?.title || '',
    message: options?.message || '',
    confirmText: options?.confirmText || 'Confirm',
    cancelText: options?.cancelText || 'Cancel',
    placeholder: options?.placeholder || '',
    defaultValue: options?.defaultValue || '',
    resolve,
  }
}

export function PopupProvider({ children }) {
  const [dialog, setDialog] = useState(null)
  const [promptValue, setPromptValue] = useState('')
  const [toasts, setToasts] = useState([])

  const closeDialog = (result) => {
    if (!dialog) {
      return
    }

    dialog.resolve(result)
    setDialog(null)
    setPromptValue('')
  }

  useEffect(() => {
    if (!dialog || dialog.type !== 'prompt') {
      return
    }

    setPromptValue(dialog.defaultValue || '')
  }, [dialog])

  useEffect(() => {
    if (!dialog) {
      return
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        closeDialog(dialog.type === 'confirm' ? false : null)
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [dialog])

  const api = useMemo(() => ({
    showConfirm(options = {}) {
      return new Promise((resolve) => {
        setDialog(buildDialog('confirm', options, resolve))
      })
    },
    showPrompt(options = {}) {
      return new Promise((resolve) => {
        setDialog(buildDialog('prompt', options, resolve))
      })
    },
    showToast(options = {}) {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
      const toast = {
        id,
        title: options?.title || '',
        message: options?.message || '',
        type: options?.type || 'info',
      }

      setToasts((currentToasts) => [...currentToasts, toast])

      const duration = Number(options?.duration || 3000)
      window.setTimeout(() => {
        setToasts((currentToasts) => currentToasts.filter((item) => item.id !== id))
      }, Number.isFinite(duration) ? duration : 3000)
    },
  }), [])

  return (
    <PopupContext.Provider value={api}>
      {children}

      <div className="popup-toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <article key={toast.id} className={`popup-toast popup-toast-${toast.type}`}>
            {toast.title ? <strong>{toast.title}</strong> : null}
            <p>{toast.message}</p>
          </article>
        ))}
      </div>

      {dialog ? (
        <div className="popup-overlay" role="dialog" aria-modal="true" onClick={() => closeDialog(dialog.type === 'confirm' ? false : null)}>
          <section className="popup-card" onClick={(event) => event.stopPropagation()}>
            {dialog.title ? <h3>{dialog.title}</h3> : null}
            {dialog.message ? <p>{dialog.message}</p> : null}

            {dialog.type === 'prompt' ? (
              <input
                autoFocus
                value={promptValue}
                onChange={(event) => setPromptValue(event.target.value)}
                placeholder={dialog.placeholder}
              />
            ) : null}

            <div className="popup-actions">
              <button type="button" className="popup-cancel" onClick={() => closeDialog(dialog.type === 'confirm' ? false : null)}>
                {dialog.cancelText}
              </button>
              <button
                type="button"
                className="popup-confirm"
                onClick={() => closeDialog(dialog.type === 'prompt' ? promptValue : true)}
              >
                {dialog.confirmText}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </PopupContext.Provider>
  )
}

export function usePopup() {
  const context = useContext(PopupContext)

  if (!context) {
    throw new Error('usePopup must be used within a PopupProvider')
  }

  return context
}
