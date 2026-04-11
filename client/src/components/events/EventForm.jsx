import { useState } from 'react'
import './css/CreateEvent.css'

const TIME_OPTIONS = Array.from({ length: 48 }, (_, index) => {
  const hour = Math.floor(index / 2)
  const minute = index % 2 === 0 ? 0 : 30
  const value = `${String(hour).padStart(2, '0')}:${minute === 0 ? '00' : '30'}`
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const hour12 = ((hour + 11) % 12) + 1
  const label = `${hour12}:${minute === 0 ? '00' : '30'} ${suffix}`

  return { value, label }
})

export default function EventForm({
  heading = 'Event Form',
  submitLabel = 'Save',
  submittingLabel = 'Saving...',
  organizerName = '',
  onSubmit,
  onCancel,
  requireBannerImage = true,
  initialValues = {},
}) {
  const [title, setTitle] = useState(initialValues.title || '')
  const [description, setDescription] = useState(initialValues.description || '')
  const [eventDate, setEventDate] = useState(initialValues.eventDate || '')
  const [eventTime, setEventTime] = useState(initialValues.eventTime || '')
  const [location, setLocation] = useState(initialValues.location || '')
  const [capacity, setCapacity] = useState(initialValues.capacity || '')
  const [freeAdmission, setFreeAdmission] = useState(Boolean(initialValues.cost === 0))
  const [cost, setCost] = useState(initialValues.cost === 0 ? '' : (initialValues.cost ?? ''))
  const [bannerFile, setBannerFile] = useState(null)
  const [tags, setTags] = useState(Array.isArray(initialValues.tags) ? initialValues.tags : [])
  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleTagKeyDown(event) {
    if (event.key !== 'Enter') {
      return
    }

    event.preventDefault()

    const nextTag = tagInput.trim().toLowerCase()

    if (!nextTag || tags.includes(nextTag) || tags.length >= 10) {
      setTagInput('')
      return
    }

    setTags((currentTags) => [...currentTags, nextTag])
    setTagInput('')
  }

  function handleRemoveTag(tagToRemove) {
    setTags((currentTags) => currentTags.filter((tag) => tag !== tagToRemove))
  }

  function validateForm() {
    if (!title.trim()) return 'Event title is required'
    if (!description.trim()) return 'Description is required'
    if (!eventDate) return 'Event date is required'
    if (!eventTime) return 'Start time is required'
    if (!location.trim()) return 'Venue address is required'
    if (!capacity) return 'Event capacity is required'
    if (requireBannerImage && !bannerFile) return 'Event banner image is required'

    const parsedCapacity = Number(capacity)
    if (!Number.isInteger(parsedCapacity) || parsedCapacity < 1) {
      return 'Capacity must be at least 1'
    }
    if (parsedCapacity > 10000) {
      return 'Capacity cannot exceed 10000'
    }

    if (!freeAdmission) {
      if (cost === '') return 'Ticket price is required unless event is free'

      const parsedCost = Number(cost)
      if (Number.isNaN(parsedCost) || parsedCost < 0) {
        return 'Ticket price must be 0 or more'
      }
    }

    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setLoading(true)
      setError('')

      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        eventDate,
        eventTime,
        location: location.trim(),
        capacity: Number(capacity),
        cost: freeAdmission ? 0 : Number(cost),
        tags,
        bannerFile,
      })
    } catch (submitError) {
      setError(submitError.message || 'Failed to save event')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="create-event-card">
      <h1>{heading}</h1>

      {error ? <p className="create-event-error">{error}</p> : null}

      <form className="create-event-form" onSubmit={handleSubmit}>
        <label>
          <span>Event Title <span className="required">*</span></span>
          <input
            type="text"
            value={title}
            onChange={(changeEvent) => setTitle(changeEvent.target.value)}
            maxLength={120}
            disabled={loading}
            placeholder="Name of Event"
          />
        </label>

        <label>
          <span>Description <span className="required">*</span></span>
          <textarea
            value={description}
            onChange={(changeEvent) => setDescription(changeEvent.target.value)}
            maxLength={5000}
            disabled={loading}
            placeholder="Describe your event in detail..."
            rows={5}
          />
        </label>

        <label>
          Tags
          <input
            type="text"
            value={tagInput}
            onChange={(changeEvent) => setTagInput(changeEvent.target.value)}
            onKeyDown={handleTagKeyDown}
            disabled={loading || tags.length >= 10}
            placeholder="Type a tag and press Enter"
          />
        </label>

        {tags.length ? (
          <div className="create-event-tags">
            {tags.map((tag) => (
              <span key={tag} className="create-event-tag">
                {tag}
                <button type="button" onClick={() => handleRemoveTag(tag)} disabled={loading}>
                  x
                </button>
              </span>
            ))}
          </div>
        ) : null}

        <div className="create-event-grid-two">
          <label>
            <span>Event Date <span className="required">*</span></span>
            <input
              type="date"
              value={eventDate}
              onChange={(changeEvent) => setEventDate(changeEvent.target.value)}
              disabled={loading}
            />
          </label>

          <label>
            <span>Start Time <span className="required">*</span></span>
            <select
              value={eventTime}
              onChange={(changeEvent) => setEventTime(changeEvent.target.value)}
              disabled={loading}
            >
              <option value="">Select time</option>
              {TIME_OPTIONS.map((timeOption) => (
                <option key={timeOption.value} value={timeOption.value}>
                  {timeOption.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label>
          <span>Venue Address <span className="required">*</span></span>
          <input
            type="text"
            value={location}
            onChange={(changeEvent) => setLocation(changeEvent.target.value)}
            maxLength={200}
            disabled={loading}
            placeholder="123 Main St, City, Province"
          />
        </label>

        <div className="create-event-grid-two">
          <label>
            Organizer Name
            <input type="text" value={organizerName} readOnly disabled />
          </label>

          <label>
            <span>Event Capacity <span className="required">*</span></span>
            <input
              type="number"
              min="1"
              max="10000"
              value={capacity}
              onChange={(changeEvent) => setCapacity(changeEvent.target.value)}
              disabled={loading}
              placeholder="100"
            />
          </label>
        </div>

        <div className="create-event-grid-two">
          <div>
            <label className="create-event-checkbox">
              <input
                type="checkbox"
                checked={freeAdmission}
                onChange={(changeEvent) => setFreeAdmission(changeEvent.target.checked)}
                disabled={loading}
              />
              Free Admission
            </label>

            <label>
              <span>Ticket Price {!freeAdmission ? <span className="required">*</span> : ''}</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={freeAdmission ? '0' : cost}
                onChange={(changeEvent) => setCost(changeEvent.target.value)}
                disabled={loading || freeAdmission}
                placeholder="$25.00"
              />
            </label>
          </div>

          <label>
            <span>Event Banner Image {requireBannerImage ? <span className="required">*</span> : ''}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(changeEvent) => setBannerFile(changeEvent.target.files?.[0] || null)}
              disabled={loading}
            />
          </label>
        </div>

        <div className="create-event-actions">
          <button type="submit" disabled={loading}>
            {loading ? submittingLabel : submitLabel}
          </button>
          <button type="button" className="create-event-cancel" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
        </div>
      </form>
    </section>
  )
}
