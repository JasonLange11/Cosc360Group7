import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../ui/Header.jsx'
import Footer from '../ui/Footer.jsx'
import CardDisplay from '../ui/CardDisplay.jsx'
import EventDetails from '../events/EventDetails.jsx'
import { deleteEvent, getAttendingEvents, getEventById, getMyEvents } from '../../lib/eventsApi.js'
import { getGroupById, getGroupMembership, getMyGroups, deleteGroup, leaveGroup } from '../../lib/groupsApi.js'
import { deleteComment as deleteCommentById, getMyComments, updateComment } from '../../lib/commentsApi.js'
import { isEventExpired } from '../../lib/eventDates.js'
import { useAuth } from '../../context/AuthContext.jsx'
import './css/SettingsPage.css'

function EventGridSection({ events, emptyMessage, onOpenEvent, onEditEvent, onDeleteEvent, deletingEventId = '' }) {
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
          {typeof onDeleteEvent === 'function' ? (
            <button
              type="button"
              className="settings-event-delete-button"
              onClick={() => onDeleteEvent(event._id, event.title)}
              disabled={deletingEventId === event._id}
            >
              {deletingEventId === event._id ? 'Deleting...' : 'Delete Event'}
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
  const [pastAttendingEvents, setPastAttendingEvents] = useState([])
  const [joinedGroups, setJoinedGroups] = useState([])
  const [myGroups, setMyGroups] = useState([])
  const [myComments, setMyComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeEventId, setActiveEventId] = useState(null)
  const [commentParentNames, setCommentParentNames] = useState({})
  const [editingCommentId, setEditingCommentId] = useState('')
  const [editingCommentContent, setEditingCommentContent] = useState('')
  const [savingCommentId, setSavingCommentId] = useState('')
  const [deletingCommentId, setDeletingCommentId] = useState('')
  const [leavingGroupId, setLeavingGroupId] = useState('')
  const [deletingEventId, setDeletingEventId] = useState('')
  const [commentActionError, setCommentActionError] = useState('')
  const [collapsed, setCollapsed] = useState({
    attending: false,
    pastEvents: false,
    groups: false,
    created: false,
    createdGroups: false,
    comments: false,
  })

  const profile = useMemo(() => currentUser || null, [currentUser])

  async function resolveCommentParentNames(comments, { created, attending, groups, createdGroups }) {
    const namesByKey = {}

    const registerName = (parentType, parentId, name) => {
      if (!parentType || !parentId || !name) {
        return
      }
      namesByKey[`${parentType}:${parentId}`] = name
    }

    const knownEvents = [...(Array.isArray(created) ? created : []), ...(Array.isArray(attending) ? attending : [])]
    knownEvents.forEach((event) => {
      registerName('event', event?._id, event?.title)
    })

    const knownGroups = [...(Array.isArray(groups) ? groups : []), ...(Array.isArray(createdGroups) ? createdGroups : [])]
    knownGroups.forEach((group) => {
      registerName('group', group?._id, group?.name)
    })

    const missingTargets = []
    const seenMissingKeys = new Set()
    const commentList = Array.isArray(comments) ? comments : []
    commentList.forEach((comment) => {
      const key = `${comment?.parentType}:${comment?.parentId}`
      const isMissing =
        (comment?.parentType === 'event' || comment?.parentType === 'group') &&
        comment?.parentId &&
        !namesByKey[key]
      if (isMissing && !seenMissingKeys.has(key)) {
        seenMissingKeys.add(key)
        missingTargets.push(comment)
      }
    })

    await Promise.all(
      missingTargets.map(async (comment) => {
        const key = `${comment.parentType}:${comment.parentId}`
        try {
          if (comment.parentType === 'event') {
            const event = await getEventById(comment.parentId)
            registerName(comment.parentType, comment.parentId, event?.title)
            return
          }

          const group = await getGroupById(comment.parentId)
          registerName(comment.parentType, comment.parentId, group?.name)
        } catch {
          namesByKey[key] = comment.parentType === 'event' ? 'Unknown event' : 'Unknown group'
        }
      })
    )

    return namesByKey
  }

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
      const attendingEventList = Array.isArray(attending) ? attending : []
      const currentAttendingEvents = attendingEventList.filter((event) => !isEventExpired(event.eventDate))
      const expiredAttendingEvents = attendingEventList.filter((event) => isEventExpired(event.eventDate))

      setMyEvents(created)
      setAttendingEvents(currentAttendingEvents)
      setPastAttendingEvents(expiredAttendingEvents)
      setJoinedGroups(Array.isArray(groups) ? groups : [])
      setMyGroups(Array.isArray(createdGroups) ? createdGroups : [])
      setMyComments(Array.isArray(comments) ? comments : [])
      const resolvedCommentParentNames = await resolveCommentParentNames(comments, {
        created,
        attending,
        groups,
        createdGroups,
      })
      setCommentParentNames(resolvedCommentParentNames)
      setCommentActionError('')
      setError('')
    } catch (err) {
      setError(err.message || 'Failed to load settings data.')
      setMyEvents([])
      setAttendingEvents([])
      setPastAttendingEvents([])
      setJoinedGroups([])
      setMyGroups([])
      setMyComments([])
      setCommentParentNames({})
      setCommentActionError('')
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

  async function handleLeaveGroup(groupId, groupName) {
    if (!window.confirm(`Are you sure you want to leave "${groupName}"?`)) {
      return
    }

    try {
      setLeavingGroupId(groupId)
      await leaveGroup(groupId)
      setJoinedGroups((previous) => previous.filter((group) => group._id !== groupId))
    } catch (err) {
      alert(err.message || 'Failed to leave group')
    } finally {
      setLeavingGroupId('')
    }
  }

  async function handleDeleteEvent(eventId, eventTitle) {
    if (!window.confirm(`Are you sure you want to delete "${eventTitle}"? This cannot be undone.`)) {
      return
    }

    try {
      setDeletingEventId(eventId)
      await deleteEvent(eventId)
      setMyEvents((previous) => previous.filter((event) => event._id !== eventId))
    } catch (err) {
      alert(err.message || 'Failed to delete event')
    } finally {
      setDeletingEventId('')
    }
  }

  function canManageComment(comment) {
    if (!currentUser) {
      return false
    }

    return currentUser.isAdmin || String(comment.userId || '') === String(currentUser.id || '')
  }

  function handleStartEditComment(comment) {
    setCommentActionError('')
    setEditingCommentId(comment._id)
    setEditingCommentContent(comment.content || '')
  }

  function handleCancelEditComment() {
    setEditingCommentId('')
    setEditingCommentContent('')
    setCommentActionError('')
  }

  async function handleSaveComment(commentId) {
    const content = editingCommentContent.trim()

    if (!content) {
      setCommentActionError('Content is required')
      return
    }

    try {
      setSavingCommentId(commentId)
      setCommentActionError('')
      const updatedComment = await updateComment(commentId, content)
      setMyComments((previous) => previous.map((comment) => (
        comment._id === commentId ? { ...comment, ...updatedComment } : comment
      )))
      setEditingCommentId('')
      setEditingCommentContent('')
    } catch (err) {
      setCommentActionError(err.message || 'Failed to update comment')
    } finally {
      setSavingCommentId('')
    }
  }

  async function handleDeleteComment(commentId) {
    if (!window.confirm('Are you sure you want to delete this comment? This cannot be undone.')) {
      return
    }

    try {
      setDeletingCommentId(commentId)
      setCommentActionError('')
      await deleteCommentById(commentId)
      setMyComments((previous) => previous.filter((comment) => comment._id !== commentId))
      if (editingCommentId === commentId) {
        setEditingCommentId('')
        setEditingCommentContent('')
      }
    } catch (err) {
      setCommentActionError(err.message || 'Failed to delete comment')
    } finally {
      setDeletingCommentId('')
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
            <button type="button" className="settings-section-title" onClick={() => toggleSection('pastEvents')}>
              Past Events <span>{collapsed.pastEvents ? 'v' : '^'}</span>
            </button>
            {collapsed.pastEvents ? null : (
              <EventGridSection
                events={pastAttendingEvents}
                emptyMessage="You have not attended any past events yet."
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
                    <li key={group._id} className="settings-list-item">
                      <div className="settings-list-item-row">
                        <span>{group.name}</span>
                        <button
                          type="button"
                          className="settings-group-leave-button"
                          onClick={() => handleLeaveGroup(group._id, group.name)}
                          disabled={leavingGroupId === group._id}
                        >
                          {leavingGroupId === group._id ? 'Leaving...' : 'Leave Group'}
                        </button>
                      </div>
                    </li>
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
                onDeleteEvent={handleDeleteEvent}
                deletingEventId={deletingEventId}
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
                    <th>Commented On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {!myComments.length ? (
                    <tr>
                      <td colSpan={5} className="settings-empty">You have not posted any comments yet.</td>
                    </tr>
                  ) : (
                    myComments.map((comment) => (
                      <tr key={comment._id}>
                        <td>
                          {editingCommentId === comment._id ? (
                            <textarea
                              className="settings-comment-edit-input"
                              rows={3}
                              value={editingCommentContent}
                              onChange={(event) => setEditingCommentContent(event.target.value)}
                            />
                          ) : (
                            comment.content
                          )}
                        </td>
                        <td>{new Date(comment.createdAt).toLocaleString()}</td>
                        <td>{comment.parentType}</td>
                        <td>{commentParentNames[`${comment.parentType}:${comment.parentId}`] || 'Unknown'}</td>
                        <td>
                          {canManageComment(comment) ? (
                            <div className="settings-comment-actions">
                              {editingCommentId === comment._id ? (
                                <>
                                  <button
                                    type="button"
                                    className="settings-comment-action-button"
                                    onClick={() => handleSaveComment(comment._id)}
                                    disabled={savingCommentId === comment._id || deletingCommentId === comment._id}
                                  >
                                    {savingCommentId === comment._id ? 'Saving...' : 'Save'}
                                  </button>
                                  <button
                                    type="button"
                                    className="settings-comment-action-button"
                                    onClick={handleCancelEditComment}
                                    disabled={savingCommentId === comment._id || deletingCommentId === comment._id}
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    className="settings-comment-action-button"
                                    onClick={() => handleStartEditComment(comment)}
                                    disabled={deletingCommentId === comment._id}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="settings-comment-action-button settings-comment-action-delete"
                                    onClick={() => handleDeleteComment(comment._id)}
                                    disabled={deletingCommentId === comment._id}
                                  >
                                    {deletingCommentId === comment._id ? 'Deleting...' : 'Delete'}
                                  </button>
                                </>
                              )}
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
            {commentActionError ? <p className="settings-comment-action-error">{commentActionError}</p> : null}
          </article>
        </section>

        <Link to="/" className="settings-back-link">&lt;- Back to Main Page</Link>
      </main>
      <Footer />

      {activeEventId ? <EventDetails eventId={activeEventId} onClose={() => setActiveEventId(null)} onAttendanceChange={loadProfileData} /> : null}
    </div>
  )
}
