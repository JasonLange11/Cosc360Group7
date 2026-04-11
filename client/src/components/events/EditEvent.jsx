import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../ui/Header'
import Footer from '../ui/Footer'
import EventForm from './EventForm.jsx'
import { getEventById, updateEvent } from '../../lib/eventsApi.js'
import { uploadEventBannerImage } from '../../lib/uploadsApi.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { TAG_OPTIONS } from '../../lib/tagOptions.js'
import { usePopup } from '../ui/PopupProvider'
import './css/CreateEvent.css'

function toDateInputValue(value) {
  if (!value) {
    return ''
  }

  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return ''
  }

  return parsed.toISOString().slice(0, 10)
}

function toTimeInputValue(value) {
  if (!value) {
    return ''
  }

  const raw = String(value).trim()
  const match = raw.match(/^(\d{1,2}):(\d{2})/)

  if (!match) {
    return ''
  }

  return `${match[1].padStart(2, '0')}:${match[2]}`
}

export default function EditEvent() {
  const navigate = useNavigate()
  const { eventId } = useParams()
  const { currentUser } = useAuth()
  const { showToast } = usePopup()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadEvent() {
      try {
        setLoading(true)
        const eventData = await getEventById(eventId)

        if (isMounted) {
          setEvent(eventData)
          setError('')
        }
      } catch (loadError) {
        if (isMounted) {
          setEvent(null)
          setError(loadError.message || 'Failed to load event')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadEvent()

    return () => {
      isMounted = false
    }
  }, [eventId])

  async function handleEditEvent(formData) {
    let bannerImage = event?.bannerImage

    if (formData.bannerFile) {
      const uploadedBanner = await uploadEventBannerImage(formData.bannerFile)
      bannerImage = uploadedBanner.imageUrl
    }

    await updateEvent(eventId, {
      title: formData.title,
      description: formData.description,
      eventDate: formData.eventDate,
      eventTime: formData.eventTime,
      location: formData.location,
      capacity: formData.capacity,
      cost: formData.cost,
      tags: formData.tags,
      bannerImage,
    })

    showToast({
      type: 'success',
      title: 'Update Successful',
      message: 'Event updated successfully.',
    })

    navigate(currentUser?.isAdmin ? '/admin' : '/settings')
  }

  return (
    <div>
      <Header />
      <main className="create-event-main">
        {loading ? <section className="create-event-card">Loading event...</section> : null}
        {!loading && error ? <section className="create-event-card create-event-error">{error}</section> : null}
        {!loading && !error && event ? (
          <EventForm
            key={event._id}
            heading="Edit Event"
            submitLabel="Save Changes"
            submittingLabel="Saving..."
            organizerName={event.organizerName || currentUser?.name || ''}
            onSubmit={handleEditEvent}
            onCancel={() => navigate(currentUser?.isAdmin ? '/admin' : '/settings')}
            requireBannerImage={false}
            initialValues={{
              title: event.title || '',
              description: event.description || '',
              eventDate: toDateInputValue(event.eventDate),
              eventTime: toTimeInputValue(event.eventTime),
              location: event.location || '',
              capacity: event.capacity || '',
              cost: typeof event.cost === 'number' ? event.cost : '',
              tags: Array.isArray(event.tags) ? event.tags : [],
            }}
            tagOptions={TAG_OPTIONS}
          />
        ) : null}
      </main>
      <Footer />
    </div>
  )
}
