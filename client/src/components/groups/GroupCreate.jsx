import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../ui/Header'
import Footer from '../ui/Footer'
import './css/GroupCreate.css'
import { createGroup } from '../../lib/groupsApi';

export default function GroupsPage() {
  const navigate = useNavigate()
  const [groupName, setGroupName] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Handle adding a tag
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

  // Handle removing a tag
  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  // Validation logic
  const validateForm = () => {
    if (!groupName.trim()) {
      setError('Group name is required')
      return false
    }
    setTags(tags.length > 0 ? tags : undefined)
    return true
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
  
    if (!validateForm()) return
  
    setLoading(true)
    setError('')
  
    try {
      const groupData = {
        name: groupName,
        description: description,
      }
      await createGroup(groupData)
      setSuccess(true)
      // Navigate to groups list or new group page
      navigate('/groups')
    } catch (err) {
      setError(err.message || 'Failed to create group')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <div className="group-create-container">
        <div className="group-create-form-wrapper">
          <h1>Create a New Group</h1>
          
          <form onSubmit={handleSubmit} className="group-create-form">
            {/* Success Message */}
            {success && (
              <div className="form-success">
                ✓ Group created successfully! Redirecting...
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="form-error">
                ⚠ {error}
              </div>
            )}

            {/* Group Name Input */}
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
                disabled={loading}
                maxLength="100"
              />
            </div>

            {/* Description Input */}
            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                id="description"
                className="form-textarea"
                placeholder="Enter group description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                maxLength="500"
                rows="4"
              />
              <span className="char-count">{description.length}/500</span>
            </div>
            {/*Tags Input */}
            <div className="form-group">
              <label htmlFor="tagInput" className="form-label">
                Tags
              </label>
              <div className="tags-input-wrapper">
                <input
                  id="tagInput"
                  type="text"
                  className="form-input tags-input"
                  placeholder="Type a tag and press Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  disabled={loading || tags.length >= 10}
                  maxLength="30"
                />
              </div>
              
              {/* Tags Display */}
              {tags.length > 0 && (
                <div className="tags-container">
                  {tags.map((tag) => (
                    <div key={tag} className="tag-badge">
                      <span className="tag-text">#{tag}</span>
                      <button
                        type="button"
                        className="tag-remove-button"
                        onClick={() => handleRemoveTag(tag)}
                        disabled={loading}
                        title="Remove tag"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <span className="char-count">{tags.length}/10 tags</span>
            </div>

            {/* 
            {/* Submit Button */}
            <button
              type="submit"
              className="form-submit-button"
              disabled={loading || !groupName.trim()}
            >
              {loading ? 'Creating Group...' : 'Create Group'}
            </button>

            {/* Cancel Button */}
            <button
              type="button"
              className="form-cancel-button"
              onClick={() => navigate('/groups')}
              disabled={loading}
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  )
}