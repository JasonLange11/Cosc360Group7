import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../ui/Header.jsx'
import Footer from '../ui/Footer.jsx'
import { getMyProfile, updateMyProfile } from '../../lib/usersApi.js'
import { useAuth } from '../../context/AuthContext.jsx'
import './css/EditProfilePage.css'

export default function EditProfilePage() {
  const navigate = useNavigate()
  const { updateCurrentUser, refreshCurrentUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    name: '',
    bio: '',
    oldPassword: '',
    newPassword: '',
    location: '',
    favoriteTags: '',
    profileImageUrl: '',
  })

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await getMyProfile()
        const profile = response?.user ?? response ?? {}
        setForm((previous) => ({
          ...previous,
          name: profile?.name || '',
          bio: profile?.bio || '',
          location: profile?.location || '',
          favoriteTags: Array.isArray(profile?.favoriteTags) ? profile.favoriteTags.join(', ') : '',
          profileImageUrl: profile?.profileImageUrl || '',
        }))
      } catch (err) {
        setError(err.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  function updateField(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (form.newPassword && !form.oldPassword) {
      setError('Old password is required to set a new password.')
      return
    }

    try {
      setSaving(true)

      const payload = {
        name: form.name,
        bio: form.bio,
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
        location: form.location,
        favoriteTags: form.favoriteTags,
        profileImageUrl: form.profileImageUrl,
      }

      const updatedProfile = await updateMyProfile(payload)
      updateCurrentUser(updatedProfile)
      await refreshCurrentUser()

      setForm((previous) => ({ ...previous, oldPassword: '', newPassword: '' }))
      setSuccess('Profile updated successfully.')
      navigate('/settings', { replace: true })
    } catch (err) {
      setError(err.message || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="edit-profile-shell">
        <Header />
        <main className="edit-profile-page">Loading profile...</main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="edit-profile-shell">
      <Header />
      <main className="edit-profile-page">
        <h2>Edit Profile</h2>

        <form onSubmit={handleSubmit} className="edit-profile-form">
          <label>
            New Name:
            <input value={form.name} onChange={(event) => updateField('name', event.target.value)} />
          </label>

          <label>
            Bio:
            <textarea rows={5} value={form.bio} onChange={(event) => updateField('bio', event.target.value)} />
          </label>

          <div className="edit-profile-password-row">
            <label>
              Old Password:
              <input type="password" value={form.oldPassword} onChange={(event) => updateField('oldPassword', event.target.value)} />
            </label>
            <label>
              New Password:
              <input type="password" value={form.newPassword} onChange={(event) => updateField('newPassword', event.target.value)} />
            </label>
          </div>

          <label>
            Location:
            <input value={form.location} onChange={(event) => updateField('location', event.target.value)} />
          </label>

          <label>
            Favorite Tags/topics:
            <input
              value={form.favoriteTags}
              onChange={(event) => updateField('favoriteTags', event.target.value)}
              placeholder="book club, hiking, coding"
            />
          </label>

          <label>
            New Profile Picture (URL):
            <input
              type="url"
              value={form.profileImageUrl}
              onChange={(event) => updateField('profileImageUrl', event.target.value)}
              placeholder="https://example.com/profile.jpg"
            />
          </label>

          {form.profileImageUrl ? <img src={form.profileImageUrl} alt="Profile preview" className="edit-profile-preview" /> : null}

          {error ? <p className="edit-profile-error">{error}</p> : null}
          {success ? <p className="edit-profile-success">{success}</p> : null}

          <div className="edit-profile-actions">
            <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
            <button type="button" onClick={() => navigate('/settings')}>Back to Settings</button>
            <Link to="/" className="edit-profile-link">&lt;- Back to Main Page</Link>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  )
}
