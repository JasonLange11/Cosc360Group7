import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../ui/Header'
import Footer from '../ui/Footer'
import { getGroupById, updateGroup } from '../../lib/groupsApi'
import { uploadGroupBannerImage } from '../../lib/uploadsApi'
import { useAuth } from '../../context/AuthContext'
import { usePopup } from '../ui/PopupProvider'
import './css/GroupCreate.css'

export default function EditGroup() {
  const navigate = useNavigate()
  const { groupId } = useParams()
  const { currentUser } = useAuth()
  const { showToast } = usePopup()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [groupName, setGroupName] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [bannerFile, setBannerFile] = useState(null)
  const [currentBannerImage, setCurrentBannerImage] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadGroup() {
      try {
        setLoading(true)
        const groupData = await getGroupById(groupId)

        if (isMounted) {
          setGroupName(groupData.name || '')
          setLocation(groupData.location || '')
          setDescription(groupData.description || '')
          setTags(Array.isArray(groupData.tags) ? groupData.tags : [])
          setCurrentBannerImage(groupData.bannerImage || '')
          setError('')
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message || 'Failed to load group')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadGroup()

    return () => {
      isMounted = false
    }
  }, [groupId])

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      const newTag = tagInput.trim().toLowerCase()
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag])
      }
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const validateForm = () => {
    if (!groupName.trim()) {
      setError('Group name is required')
      return false
    }
    if (!description.trim()) {
      setError('Description is required')
      return false
    }
    if (!location.trim()) {
      setError('Location is required')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setSaving(true)
    setError('')

    try {
      let bannerImage = currentBannerImage

      if (bannerFile) {
        const uploaded = await uploadGroupBannerImage(bannerFile)
        bannerImage = uploaded.imageUrl
      }

      await updateGroup(groupId, {
        name: groupName,
        description,
        tags,
        location,
        bannerImage,
      })
      showToast({
        type: 'success',
        title: 'Update Successful',
        message: 'Group updated successfully.',
      })
      navigate(currentUser?.isAdmin ? '/admin' : '/settings')
    } catch (err) {
      setError(err.message || 'Failed to update group')
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: err.message || 'Failed to update group',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    navigate(currentUser?.isAdmin ? '/admin' : '/settings')
  }

  return (
    <>
      <Header />
      <div className="group-create-container">
        <div className="group-create-form-wrapper">
          <h1>Edit Group</h1>

          {loading ? (
            <p>Loading group...</p>
          ) : (
            <form onSubmit={handleSubmit} className="group-create-form">
              {error && (
                <div className="form-error">
                  ⚠ {error}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="groupName" className="form-label">
                  Group Name <span className="required">*</span>
                </label>
                <input
                  id="groupName"
                  type="text"
                  className="form-input"
                  placeholder="Enter group name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  disabled={saving}
                  maxLength="100"
                />
              </div>

              <div className="form-group">
                <label htmlFor="location" className="form-label">
                  Location <span className="required">*</span>
                </label>
                <input
                  id="location"
                  type="text"
                  className="form-input"
                  placeholder="Enter group location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={saving}
                  maxLength="100"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Description <span className="required">*</span>
                </label>
                <textarea
                  id="description"
                  className="form-textarea"
                  placeholder="Enter group description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={saving}
                  maxLength="500"
                  rows="4"
                />
                <span className="char-count">{description.length}/500</span>
              </div>

              <div className="form-group">
                <label htmlFor="tagInput" className="form-label">
                  Tags
                </label>
                <input
                  id="tagInput"
                  type="text"
                  className="form-input"
                  placeholder="Type a tag and press Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  disabled={saving || tags.length >= 10}
                  maxLength="30"
                />

                {tags.length > 0 && (
                  <div className="create-event-tags">
                    {tags.map((tag) => (
                      <span key={tag} className="create-event-tag">
                        {tag}
                        <button type="button" onClick={() => handleRemoveTag(tag)} disabled={saving}>
                          x
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <span className="char-count">{tags.length}/10 tags</span>
              </div>

              <div className="form-group">
                <label htmlFor="bannerImage" className="form-label">
                  Banner Image
                </label>
                {currentBannerImage && !bannerFile ? (
                  <img
                    src={currentBannerImage}
                    alt="Current banner"
                    style={{ marginBottom: '0.5rem', maxHeight: '160px', objectFit: 'cover', borderRadius: '6px', width: '100%' }}
                  />
                ) : null}
                {bannerFile ? (
                  <img
                    src={URL.createObjectURL(bannerFile)}
                    alt="New banner preview"
                    style={{ marginBottom: '0.5rem', maxHeight: '160px', objectFit: 'cover', borderRadius: '6px', width: '100%' }}
                  />
                ) : null}
                <input
                  id="bannerImage"
                  type="file"
                  className="form-input"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                  disabled={saving}
                />
              </div>

              <button type="submit" className="form-submit-button" disabled={saving || !groupName.trim()}>
                  {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" className="form-cancel-button" onClick={handleCancel} disabled={saving}>
                  Cancel
              </button>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
