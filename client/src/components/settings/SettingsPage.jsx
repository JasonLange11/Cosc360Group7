import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../ui/Header.jsx'
import Footer from '../ui/Footer.jsx'
import CardDisplay from '../events/CardDisplay.jsx'
import EventDetails from '../events/EventDetails.jsx'
import { getMyDashboard } from '../../lib/usersApi.js'
import {
  createGroup,
  deleteGroup,
  joinGroup,
  leaveGroup,
  updateGroup,
} from '../../lib/groupsApi.js'
import { deleteComment, updateComment } from '../../lib/commentsApi.js'
import { useAuth } from '../../context/AuthContext.jsx'
import './css/SettingsPage.css'

function formatDate(dateValue) {
  if (!dateValue) {
    return 'N/A'
  }

  return new Date(dateValue).toLocaleDateString()
}

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
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeEventId, setActiveEventId] = useState(null)
  const [collapsed, setCollapsed] = useState({
    attending: false,
    groups: false,
    created: false,
    comments: false,
  })

  const [groupForm, setGroupForm] = useState({ name: '', description: '' })
  const [joinGroupId, setJoinGroupId] = useState('')
  const [groupError, setGroupError] = useState('')
  const [savingGroupId, setSavingGroupId] = useState('')
  const [editingGroupId, setEditingGroupId] = useState('')
  const [editingGroupData, setEditingGroupData] = useState({ name: '', description: '' })

  const [editingCommentId, setEditingCommentId] = useState('')
  const [editingCommentContent, setEditingCommentContent] = useState('')
  const [commentError, setCommentError] = useState('')

  const profile = useMemo(() => dashboard?.profile || currentUser || null, [dashboard, currentUser])

  async function loadDashboard() {
    try {
      setLoading(true)
      const data = await getMyDashboard()
      setDashboard(data)
      setError('')
    } catch (err) {
      setError(err.message || 'Failed to load profile dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  function toggleSection(sectionKey) {
    setCollapsed((previous) => ({
      ...previous,
      [sectionKey]: !previous[sectionKey],
    }))
  }

  async function handleCreateGroup(event) {
    event.preventDefault()
    setGroupError('')

    try {
      await createGroup(groupForm)
      setGroupForm({ name: '', description: '' })
      await loadDashboard()
    } catch (err) {
      setGroupError(err.message || 'Failed to create group.')
    }
  }

  async function handleJoinGroup(event) {
    event.preventDefault()
    setGroupError('')

    try {
      await joinGroup(joinGroupId.trim())
      setJoinGroupId('')
      await loadDashboard()
    } catch (err) {
      setGroupError(err.message || 'Failed to join group.')
    }
  }

  async function handleLeaveGroup(groupId) {
    setGroupError('')
    setSavingGroupId(groupId)

    try {
      await leaveGroup(groupId)
      await loadDashboard()
    } catch (err) {
      setGroupError(err.message || 'Failed to leave group.')
    } finally {
      setSavingGroupId('')
    }
  }

  async function handleDeleteGroup(groupId) {
    setGroupError('')
    setSavingGroupId(groupId)

    try {
      await deleteGroup(groupId)
      await loadDashboard()
    } catch (err) {
      setGroupError(err.message || 'Failed to delete group.')
    } finally {
      setSavingGroupId('')
    }
  }

  async function handleSaveGroup(groupId) {
    setGroupError('')
    setSavingGroupId(groupId)

    try {
      await updateGroup(groupId, editingGroupData)
      setEditingGroupId('')
      setEditingGroupData({ name: '', description: '' })
      await loadDashboard()
    } catch (err) {
      setGroupError(err.message || 'Failed to update group.')
    } finally {
      setSavingGroupId('')
    }
  }

  async function handleDeleteComment(commentId) {
    setCommentError('')

    try {
      await deleteComment(commentId)
      await loadDashboard()
    } catch (err) {
      setCommentError(err.message || 'Failed to delete comment.')
    }
  }

  async function handleSaveComment(commentId) {
    setCommentError('')

    try {
      await updateComment(commentId, editingCommentContent)
      setEditingCommentId('')
      setEditingCommentContent('')
      await loadDashboard()
    } catch (err) {
      setCommentError(err.message || 'Failed to update comment.')
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
                events={dashboard?.attendingEvents || []}
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
              <div>
                <form className="settings-form-inline" onSubmit={handleCreateGroup}>
                  <input
                    value={groupForm.name}
                    onChange={(event) => setGroupForm((previous) => ({ ...previous, name: event.target.value }))}
                    placeholder="New group name"
                    required
                  />
                  <input
                    value={groupForm.description}
                    onChange={(event) => setGroupForm((previous) => ({ ...previous, description: event.target.value }))}
                    placeholder="Description"
                  />
                  <button type="submit">Create</button>
                </form>

                <form className="settings-form-inline" onSubmit={handleJoinGroup}>
                  <input
                    value={joinGroupId}
                    onChange={(event) => setJoinGroupId(event.target.value)}
                    placeholder="Join by Group ID"
                    required
                  />
                  <button type="submit">Join</button>
                </form>

                {groupError ? <p className="settings-inline-error">{groupError}</p> : null}

                {dashboard?.groups?.length ? (
                  <ul className="settings-list">
                    {dashboard.groups.map((group) => {
                      const isOwner = group.ownerId?.toString() === currentUser?.id?.toString()
                      const isEditing = editingGroupId === group._id

                      return (
                        <li key={group._id}>
                          {isEditing ? (
                            <div className="settings-edit-row">
                              <input
                                value={editingGroupData.name}
                                onChange={(event) => setEditingGroupData((previous) => ({ ...previous, name: event.target.value }))}
                              />
                              <input
                                value={editingGroupData.description}
                                onChange={(event) => setEditingGroupData((previous) => ({ ...previous, description: event.target.value }))}
                              />
                              <button type="button" onClick={() => handleSaveGroup(group._id)} disabled={savingGroupId === group._id}>Save</button>
                              <button type="button" onClick={() => setEditingGroupId('')}>Cancel</button>
                            </div>
                          ) : (
                            <div className="settings-group-item">
                              <div>
                                <p className="settings-list-title">{group.name}</p>
                                <p>{group.description || 'No description'}</p>
                                <p className="settings-meta">Group ID: {group._id}</p>
                              </div>
                              <div className="settings-group-actions">
                                <button type="button" onClick={() => handleLeaveGroup(group._id)} disabled={savingGroupId === group._id}>Leave</button>
                                {isOwner ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingGroupId(group._id)
                                        setEditingGroupData({ name: group.name, description: group.description || '' })
                                      }}
                                    >
                                      Edit
                                    </button>
                                    <button type="button" onClick={() => handleDeleteGroup(group._id)} disabled={savingGroupId === group._id}>Delete</button>
                                  </>
                                ) : null}
                              </div>
                            </div>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <p className="settings-empty">You are not part of any groups yet.</p>
                )}
              </div>
            )}
          </article>

          <article className="settings-card-section">
            <button type="button" className="settings-section-title" onClick={() => toggleSection('created')}>
              Events Created <span>{collapsed.created ? 'v' : '^'}</span>
            </button>
            {collapsed.created ? null : (
              <EventGridSection
                events={dashboard?.createdEvents || []}
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
              <div>
                {commentError ? <p className="settings-inline-error">{commentError}</p> : null}
                {dashboard?.commentHistory?.length ? (
                  <table className="settings-comments-table">
                    <thead>
                      <tr>
                        <th>Comment</th>
                        <th>Date</th>
                        <th>Event</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.commentHistory.map((comment) => {
                        const isEditing = editingCommentId === comment._id

                        return (
                          <tr key={comment._id}>
                            <td>
                              {isEditing ? (
                                <input
                                  value={editingCommentContent}
                                  onChange={(event) => setEditingCommentContent(event.target.value)}
                                />
                              ) : comment.content}
                            </td>
                            <td>{formatDate(comment.createdAt)}</td>
                            <td>{comment.eventTitle}</td>
                            <td>
                              {isEditing ? (
                                <>
                                  <button type="button" onClick={() => handleSaveComment(comment._id)}>Save</button>
                                  <button type="button" onClick={() => setEditingCommentId('')}>Cancel</button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingCommentId(comment._id)
                                      setEditingCommentContent(comment.content)
                                    }}
                                  >
                                    Edit
                                  </button>
                                  <button type="button" onClick={() => handleDeleteComment(comment._id)}>Delete</button>
                                </>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                ) : (
                  <p className="settings-empty">You have not posted comments yet.</p>
                )}
              </div>
            )}
          </article>
        </section>

        <Link to="/" className="settings-back-link">&lt;- Back to Main Page</Link>
      </main>
      <Footer />

      {activeEventId ? <EventDetails eventId={activeEventId} onClose={() => setActiveEventId(null)} onAttendanceChange={loadDashboard} /> : null}
    </div>
  )
}
