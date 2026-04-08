import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { updateUserAdmin, updateUserProfile } from '../../lib/usersApi'
import './css/AdminUserDetailsModal.css'

function buildInitialForm(user) {
  return {
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    favoriteTags: Array.isArray(user?.favoriteTags) ? user.favoriteTags.join(', ') : '',
  }
}

export default function AdminUserDetailsModal({ user, onClose, onUserUpdated }) {
  const { currentUser } = useAuth()
  const [form, setForm] = useState(() => buildInitialForm(user))
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingAdmin, setSavingAdmin] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    setForm(buildInitialForm(user))
    setError('')
    setSuccess('')
  }, [user])

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  if (!user) {
    return null
  }

  const isEditingSelf = String(currentUser?.id || '') === String(user.id || user._id || '')

  function updateField(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  async function handleSaveProfile(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    try {
      setSavingProfile(true)
      const updatedUser = await updateUserProfile(user.id || user._id, {
        name: form.name,
        bio: form.bio,
        location: form.location,
        favoriteTags: form.favoriteTags,
      })

      onUserUpdated(updatedUser)
      setSuccess('Profile updated successfully.')
    } catch (err) {
      setError(err.message || 'Failed to update user profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleToggleAdmin() {
    setError('')
    setSuccess('')

    try {
      setSavingAdmin(true)
      const updatedUser = await updateUserAdmin(user.id || user._id, !Boolean(user.isAdmin))
      onUserUpdated(updatedUser)
      setSuccess(updatedUser.isAdmin ? 'User promoted to admin.' : 'Admin access removed.')
    } catch (err) {
      setError(err.message || 'Failed to update admin access.')
    } finally {
      setSavingAdmin(false)
    }
  }

  return (
    <div className="admin-user-modal-overlay" onClick={onClose}>
      <div className="admin-user-modal" onClick={(event) => event.stopPropagation()}>
        <header className="admin-user-modal-header">
          <div>
            <h3>Edit User</h3>
            <p>{user.email}</p>
          </div>
          <button type="button" className="admin-user-close" onClick={onClose} aria-label="Close user details">
            x
          </button>
        </header>

        <div className="admin-user-summary">
          <span className={`admin-user-pill ${user.isDisabled ? 'is-disabled' : 'is-active'}`}>
            {user.isDisabled ? 'Disabled' : 'Active'}
          </span>
        </div>

        <form onSubmit={handleSaveProfile} className="admin-user-form">
          <label>
            Name
            <input value={form.name} onChange={(event) => updateField('name', event.target.value)} />
          </label>

          <label>
            Bio
            <textarea rows={4} value={form.bio} onChange={(event) => updateField('bio', event.target.value)} />
          </label>

          <label>
            Location
            <input value={form.location} onChange={(event) => updateField('location', event.target.value)} />
          </label>

          <label>
            Favorite Tags/topics
            <input
              value={form.favoriteTags}
              onChange={(event) => updateField('favoriteTags', event.target.value)}
              placeholder="book club, hiking, coding"
            />
          </label>

          {user.profileImageUrl ? (
            <img src={user.profileImageUrl} alt={`${user.name || 'User'} profile`} className="admin-user-preview" />
          ) : null}

          {error ? <p className="admin-user-error">{error}</p> : null}
          {success ? <p className="admin-user-success">{success}</p> : null}

          <div className="admin-user-actions">
            <button type="submit" disabled={savingProfile || savingAdmin}>
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              className={user.isAdmin ? 'admin-user-role-button is-admin' : 'admin-user-role-button'}
              onClick={handleToggleAdmin}
              disabled={savingProfile || savingAdmin || (isEditingSelf && user.isAdmin)}
            >
              {savingAdmin ? 'Updating...' : (user.isAdmin ? 'Remove Admin' : 'Make Admin')}
            </button>
            <button type="button" className="admin-user-cancel" onClick={onClose}>
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}