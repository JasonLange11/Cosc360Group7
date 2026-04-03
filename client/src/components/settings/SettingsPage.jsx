import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../ui/Header.jsx'
import Footer from '../ui/Footer.jsx'
import CardDisplay from '../events/ui/CardDisplay.jsx'
import EventDetails from '../events/EventDetails.jsx'
import { getAttendingEvents, getMyEvents } from '../../lib/eventsApi.js'
import { useAuth } from '../../context/AuthContext.jsx'
import './css/SettingsPage.css'

const mockGroups = [
  { id: 'g1', name: 'Book Club' },
  { id: 'g2', name: 'Car Club' },
  { id: 'g3', name: 'Anime Club' },
]

const mockCommentHistory = [
  { id: 'c1', comment: 'Hello!', date: '2026-02-26', event: 'Book Club Event' },
  { id: 'c2', comment: 'What a good time', date: '2026-02-28', event: 'Car Meetup' },
]

function EventGridSection({ events, emptyMessage, onOpenEvent }) {
  if (!events.length) {
    return <p className="settings-empty">{emptyMessage}</p>
  }

  return (
    <div className="settings-events-grid">
      {events.map((event) => (
        <CardDisplay
          key={event._id}
          eventId={event._id}
          onOpenEvent={onOpenEvent}
          img={{
            src: event.bannerImage,
            alt: event.title,
          }}
          heading={event.title}
          details={[
            ['fa-calendar', new Date(event.eventDate).toLocaleDateString()],
            ['fa-clock', event.eventTime],
            ['fa-location-dot', event.location],
          ]}
          description={event.description}
        />
      ))}
    </div>
  )
}

export default function SettingsPage() {
  const { currentUser } = useAuth()
  const [myEvents, setMyEvents] = useState([])
  const [attendingEvents, setAttendingEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeEventId, setActiveEventId] = useState(null)
  const [collapsed, setCollapsed] = useState({
    attending: false,
    groups: false,
    created: false,
    comments: false,
  })

  const profile = useMemo(() => currentUser || null, [currentUser])

  async function loadProfileData() {
    try {
      setLoading(true)
      const [created, attending] = await Promise.all([
        getMyEvents(),
        getAttendingEvents(),
      ])

      setMyEvents(created)
      setAttendingEvents(attending)
      setError('')
    } catch (err) {
      setError(err.message || 'Failed to load settings data.')
      setMyEvents([])
      setAttendingEvents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfileData()
  }, [])

  function toggleSection(sectionKey) {
    setCollapsed((previous) => ({
      ...previous,
      [sectionKey]: !previous[sectionKey],
    }))
  }

  if (loading) {
    return (
      <div className="settings-page-shell">
        <Header />
        <main className="settings-page">Loading profile...</main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="settings-page-shell">
        <Header />
        <main className="settings-page settings-error">{error}</main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="settings-page-shell">
      <Header />
      <main className="settings-page">
        <section className="settings-top-row">
          <div>
            <h2>Settings</h2>
            <p className="settings-user">@{profile?.name || 'User'}</p>
            <p>{profile?.bio || 'No bio added yet.'}</p>
            <p><strong>Location:</strong> {profile?.location || 'Not set'}</p>
            <p><strong>Favorite Tags:</strong> {Array.isArray(profile?.favoriteTags) && profile.favoriteTags.length ? profile.favoriteTags.join(', ') : 'None'}</p>
          </div>
          <div className="settings-top-actions">
            <Link to="/settings/edit" className="settings-btn-primary">Edit Profile</Link>
            {profile?.profileImageUrl ? <img src={profile.profileImageUrl} alt="Profile" className="settings-avatar" /> : null}
          </div>
        </section>

        <section className="settings-grid">
          <article className="settings-card-section">
            <button type="button" className="settings-section-title" onClick={() => toggleSection('attending')}>
              Events Attending <span>{collapsed.attending ? 'v' : '^'}</span>
            </button>
            {collapsed.attending ? null : (
              <EventGridSection
                events={attendingEvents}
                emptyMessage="You are not attending any events yet."
                onOpenEvent={setActiveEventId}
              />
            )}
          </article>

          <article className="settings-card-section">
            <button type="button" className="settings-section-title" onClick={() => toggleSection('groups')}>
              Groups <span>{collapsed.groups ? 'v' : '^'}</span>
            </button>
            {collapsed.groups ? null : (
              <ul className="settings-list">
                {mockGroups.map((group) => (
                  <li key={group.id} className="settings-list-item">{group.name}</li>
                ))}
              </ul>
            )}
          </article>

          <article className="settings-card-section">
            <button type="button" className="settings-section-title" onClick={() => toggleSection('created')}>
              Events Created <span>{collapsed.created ? 'v' : '^'}</span>
            </button>
            {collapsed.created ? null : (
              <EventGridSection
                events={myEvents}
                emptyMessage="You have not created any events yet."
                onOpenEvent={setActiveEventId}
              />
            )}
          </article>

          <article className="settings-card-section">
            <button type="button" className="settings-section-title" onClick={() => toggleSection('comments')}>
              Comment History <span>{collapsed.comments ? 'v' : '^'}</span>
            </button>
            {collapsed.comments ? null : (
              <table className="settings-comments-table">
                <thead>
                  <tr>
                    <th>Comment</th>
                    <th>Date</th>
                    <th>Event</th>
                  </tr>
                </thead>
                <tbody>
                  {mockCommentHistory.map((comment) => (
                    <tr key={comment.id}>
                      <td>{comment.comment}</td>
                      <td>{comment.date}</td>
                      <td>{comment.event}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </article>
        </section>

        <Link to="/" className="settings-back-link">&lt;- Back to Main Page</Link>
      </main>
      <Footer />

      {activeEventId ? <EventDetails eventId={activeEventId} onClose={() => setActiveEventId(null)} onAttendanceChange={loadProfileData} /> : null}
    </div>
  )
}
