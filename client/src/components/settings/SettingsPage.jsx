import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../ui/Header.jsx'
import Footer from '../ui/Footer.jsx'
import CardDisplay from '../ui/CardDisplay.jsx'
import EventDetails from '../events/EventDetails.jsx'
import { getAttendingEvents, getMyEvents } from '../../lib/eventsApi.js'
import { getGroupMembership, getMyGroups, deleteGroup } from '../../lib/groupsApi.js'
import { getMyComments } from '../../lib/commentsApi.js'
import { useAuth } from '../../context/AuthContext.jsx'
import './css/SettingsPage.css'

function EventGridSection({ events, emptyMessage, onOpenEvent, onEditEvent }) {
  if (!events.length) {
    return <p className="settings-empty">{emptyMessage}</p>
  }

  return (
    <div className="settings-events-grid">
      {events.map((event) => (
        <div key={event._id} className="settings-event-item">
          <CardDisplay
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
          {typeof onEditEvent === 'function' ? (
            <button
              type="button"
              className="settings-event-edit-button"
              onClick={() => onEditEvent(event._id)}
            >
              Edit Event
            </button>
          ) : null}
        </div>
      ))}
    </div>
  )
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [myEvents, setMyEvents] = useState([])
  const [attendingEvents, setAttendingEvents] = useState([])
  const [joinedGroups, setJoinedGroups] = useState([])
  const [myGroups, setMyGroups] = useState([])
  const [myComments, setMyComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeEventId, setActiveEventId] = useState(null)
  const [collapsed, setCollapsed] = useState({
    attending: false,
    groups: false,
    created: false,
    createdGroups: false,
    comments: false,
  })

  const profile = useMemo(() => currentUser || null, [currentUser])

  async function loadProfileData() {
    try {
      setLoading(true)
      const [created, attending, groups, createdGroups, comments] = await Promise.all([
        getMyEvents(),
        getAttendingEvents(),
        getGroupMembership(),
        getMyGroups(),
        getMyComments(),
      ])

      setMyEvents(created)
      setAttendingEvents(attending)
      setJoinedGroups(Array.isArray(groups) ? groups : [])
      setMyGroups(Array.isArray(createdGroups) ? createdGroups : [])
      setMyComments(Array.isArray(comments) ? comments : [])
      setError('')
    } catch (err) {
      setError(err.message || 'Failed to load settings data.')
      setMyEvents([])
      setAttendingEvents([])
      setJoinedGroups([])
      setMyGroups([])
      setMyComments([])
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

  async function handleDeleteGroup(groupId, groupName) {
    if (!window.confirm(`Are you sure you want to delete "${groupName}"? This cannot be undone.`)) {
      return
    }
    try {
      await deleteGroup(groupId)
      setMyGroups((previous) => previous.filter((g) => g._id !== groupId))
    } catch (err) {
      alert(err.message || 'Failed to delete group')
    }
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
            <p className="settings-user">{profile?.name || 'User'}</p>
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
              !joinedGroups.length ? (
                <p className="settings-empty">You have not joined any groups yet.</p>
              ) : (
                <ul className="settings-list">
                  {joinedGroups.map((group) => (
                    <li key={group._id} className="settings-list-item">{group.name}</li>
                  ))}
                </ul>
              )
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
                onEditEvent={(eventId) => navigate(`/events/${eventId}/edit`)}
              />
            )}
          </article>

          <article className="settings-card-section">
            <button type="button" className="settings-section-title" onClick={() => toggleSection('createdGroups')}>
              Groups Created <span>{collapsed.createdGroups ? 'v' : '^'}</span>
            </button>
            {collapsed.createdGroups ? null : (
              !myGroups.length ? (
                <p className="settings-empty">You have not created any groups yet.</p>
              ) : (
                <div className="settings-events-grid">
                  {myGroups.map((group) => (
                    <div key={group._id} className="settings-event-item">
                      <CardDisplay
                        img={{
                          src: group.bannerImage,
                          alt: group.name,
                        }}
                        heading={group.name}
                        details={[
                          ['fa-location-dot', group.location],
                        ]}
                        description={group.description}
                      />
                      <button
                        type="button"
                        className="settings-event-edit-button"
                        onClick={() => navigate(`/groups/${group._id}/edit`)}
                      >
                        Edit Group
                      </button>
                      <button
                        type="button"
                        className="settings-event-delete-button"
                        onClick={() => handleDeleteGroup(group._id, group.name)}
                      >
                        Delete Group
                      </button>
                    </div>
                  ))}
                </div>
              )
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
                    <th>Type</th>
                    <th>Parent ID</th>
                  </tr>
                </thead>
                <tbody>
                  {!myComments.length ? (
                    <tr>
                      <td colSpan={4} className="settings-empty">You have not posted any comments yet.</td>
                    </tr>
                  ) : (
                    myComments.map((comment) => (
                      <tr key={comment._id}>
                        <td>{comment.content}</td>
                        <td>{new Date(comment.createdAt).toLocaleString()}</td>
                        <td>{comment.parentType}</td>
                        <td>{String(comment.parentId || '')}</td>
                      </tr>
                    ))
                  )}
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
