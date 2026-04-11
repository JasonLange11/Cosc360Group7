import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../ui/Header'
import Footer from '../ui/Footer'
import { useAuth } from '../../context/AuthContext.jsx'
import { createEvent } from '../../lib/eventsApi.js'
import { uploadEventBannerImage } from '../../lib/uploadsApi.js'
import { TAG_OPTIONS } from '../../lib/tagOptions.js'
import { usePopup } from '../ui/PopupProvider'
import EventForm from './EventForm.jsx'
import './css/CreateEvent.css'

export default function CreateEvent() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { showToast } = usePopup()

  async function handleCreateEvent(formData) {
    const uploadedBanner = await uploadEventBannerImage(formData.bannerFile)

    await createEvent({
      title: formData.title,
      description: formData.description,
      eventDate: formData.eventDate,
      eventTime: formData.eventTime,
      location: formData.location,
      capacity: formData.capacity,
      cost: formData.cost,
      bannerImage: uploadedBanner.imageUrl,
      tags: formData.tags,
    })

    showToast({
      type: 'success',
      title: 'Event Created',
      message: 'Your event was created successfully.',
    })

    navigate('/')
  }

  return (
    <div>
      <Header />
      <main className="create-event-main">
        <EventForm
          heading="Create Event"
          submitLabel="Create Event"
          submittingLabel="Creating Event..."
          organizerName={currentUser?.name || ''}
          onSubmit={handleCreateEvent}
          onCancel={() => navigate('/')}
          requireBannerImage
          tagOptions={TAG_OPTIONS}
        />
      </main>
      <Footer />
    </div>
  )
}
