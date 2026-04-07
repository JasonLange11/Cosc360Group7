import { useEffect, useMemo, useState } from 'react'
import '@fortawesome/fontawesome-free/css/all.min.css'
import { attendEvent, getEventById, unattendEvent } from '../../lib/eventsApi'
import { addTagToEvent, removeTagFromEvent } from '../../lib/eventsApi'
import { isEventExpired } from '../../lib/eventDates'
import { useAuth } from '../../context/AuthContext.jsx'
import CommentSection from '../comments/CommentSection'
import './css/EventDetails.css'

function formatEventDate(dateString) {
    if (!dateString) {
        return 'Date TBD'
    }

    const date = new Date(dateString)

    return date.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    })
}

function formatEventTime(timeString) {
    if (!timeString) {
        return 'Time TBD'
    }

    const parsed = new Date(`1970-01-01 ${timeString}`)

    if (Number.isNaN(parsed.getTime())) {
        return timeString
    }

    const twentyFourHour = parsed.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    })

    const twelveHour = parsed.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }).toLowerCase()

    return `${twentyFourHour} (${twelveHour})`
}

export default function EventDetails({
    eventId,
    onClose,
    actionLabel = 'Register for this event',
    onAction,
    onAttendanceChange,
    actionClassName = 'event-details-button',
    actionDisabled = false,
    actionError = '',
    enableTagEdit = false,
}) {
    const { currentUser } = useAuth()
    const [event, setEvent] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [actionLoading, setActionLoading] = useState(false)
    const [internalActionError, setInternalActionError] = useState('')

    const [newTag, setNewTag] = useState('')
    const [tagBusy, setTagBusy] = useState(false)
    const [tagError, setTagError] = useState('')

    useEffect(() => {
        function handleEscape(eventKey) {
            if (eventKey.key === 'Escape' && typeof onClose === 'function') {
                onClose()
            }
        }

        window.addEventListener('keydown', handleEscape)

        return () => {
            window.removeEventListener('keydown', handleEscape)
        }
    }, [onClose])

    useEffect(() => {
        let isMounted = true

        async function loadEvent() {
            try {
                setLoading(true)
                const eventData = await getEventById(eventId)

                if (isMounted) {
                    setEvent(eventData)
                    setError(null)
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.message || 'Failed to load event details')
                    setEvent(null)
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

    const formattedCost = useMemo(() => {
        if (!event || typeof event.cost !== 'number') {
            return '$0.00'
        }

        return new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: 'CAD',
            minimumFractionDigits: 2,
        }).format(event.cost)
    }, [event])

    const isAttending = Boolean(
        currentUser
        && Array.isArray(event?.attendees)
        && event.attendees.some((attendeeId) => attendeeId.toString() === currentUser.id.toString())
    )
    const eventIsExpired = isEventExpired(event?.eventDate)

    const defaultActionLabel = currentUser
        ? (isAttending ? 'Leave event' : (eventIsExpired ? 'Event has ended' : 'Register for this event'))
        : 'Login to register'

    const resolvedActionLabel = onAction ? actionLabel : defaultActionLabel
    const resolvedActionDisabled = actionDisabled || actionLoading || (!onAction && eventIsExpired && !isAttending)

    if (loading) {
        return (
            <div className="event-details-overlay" onClick={onClose}>
                <div className="event-details-shell" onClick={(clickEvent) => clickEvent.stopPropagation()}>
                    Loading event details...
                </div>
            </div>
        )
    }

    if (error || !event) {
        return (
            <div className="event-details-overlay" onClick={onClose}>
                <main
                    className="event-details-shell event-details-error"
                    onClick={(clickEvent) => clickEvent.stopPropagation()}
                >
                    {error || 'Event not found'}
                </main>
            </div>
        )
    }

    const attendanceCount = Array.isArray(event.attendees) ? event.attendees.length : 0
    const eventTags = Array.isArray(event.tags) ? event.tags : []

    const handleAddTag = async (submitEvent) => {
        submitEvent.preventDefault()
        const tag = newTag.trim().toLowerCase()
        if (!tag) return

        try {
            setTagBusy(true)
            setTagError('')
            const updatedEvent = await addTagToEvent(eventId, tag)
            setEvent(updatedEvent)
            setNewTag('')
        } catch (err) {
            setTagError(err.message || 'Failed to add tag')
        } finally {
            setTagBusy(false)
        }
    }

    const handleRemoveTag = async (tag) => {
        try {
            setTagBusy(true)
            setTagError('')
            const updatedEvent = await removeTagFromEvent(eventId, tag)
            setEvent(updatedEvent)
        } catch (err) {
            setTagError(err.message || 'Failed to remove tag')
        } finally {
            setTagBusy(false)
        }
    }


    const handleActionClick = async () => {
        setInternalActionError('')

        if (typeof onAction === 'function') {
            await onAction(event)
            return
        }

        if (!currentUser) {
            setInternalActionError('You must be logged in to register for an event.')
            return
        }

        if (eventIsExpired && !isAttending) {
            setInternalActionError('This event has already ended.')
            return
        }

        try {
            setActionLoading(true)
            const updatedEvent = isAttending ? await unattendEvent(event._id) : await attendEvent(event._id)
            setEvent(updatedEvent)

            if (typeof onAttendanceChange === 'function') {
                onAttendanceChange(updatedEvent)
            }
        } catch (err) {
            setInternalActionError(err.message || 'Failed to update attendance.')
        } finally {
            setActionLoading(false)
        }
    }

    return (
        <div className="event-details-overlay" onClick={onClose}>
            <main className="event-details-shell" onClick={(clickEvent) => clickEvent.stopPropagation()}>
                <section className="event-details-card">
                    <div className="event-details-image-wrap">
                        <img src={event.bannerImage} alt={event.title} className="event-details-image" />
                            {eventTags.length > 0 ? (
                                <div className="event-details-tags">
                                    {eventTags.map((tag) => (
                                    <span key={tag} className="event-details-tag">
                                        {tag}
                                        {enableTagEdit ? (
                                        <button
                                            type="button"
                                            className="event-details-tag-remove"
                                            onClick={() => handleRemoveTag(tag)}
                                            disabled={tagBusy}
                                            aria-label={`Remove ${tag} tag`}
                                        >
                                            x
                                        </button>
                                        ) : null}
                                    </span>
                                    ))}
                                </div>
                            ) : null}
                    </div>

                    <div className="event-details-content">
                        <h2 className="event-details-title">{event.title}</h2>

                        {enableTagEdit ? (
                            <>
                                <form className="event-tag-form" onSubmit={handleAddTag}>
                                <input
                                    type="text"
                                    value={newTag}
                                    onChange={(changeEvent) => setNewTag(changeEvent.target.value)}
                                    placeholder="Add tag"
                                    disabled={tagBusy}
                                />
                                <button type="submit" disabled={tagBusy}>
                                    {tagBusy ? 'Saving...' : 'Add tag'}
                                </button>
                                </form>
                                {tagError ? <p className="event-tag-error">{tagError}</p> : null}
                            </>
                        ) : null}

                        <div className="event-details-grid">
                            <div className="event-detail-item">
                                <i className="fa-regular fa-calendar"></i>
                                <div>
                                    <p className="event-detail-label">Date</p>
                                    <p className="event-detail-value">{formatEventDate(event.eventDate)}</p>
                                </div>
                            </div>

                            <div className="event-detail-item">
                                <i className="fa-regular fa-clock"></i>
                                <div>
                                    <p className="event-detail-label">Time</p>
                                    <p className="event-detail-value">{formatEventTime(event.eventTime)}</p>
                                </div>
                            </div>

                            <div className="event-detail-item">
                                <i className="fa-solid fa-location-dot"></i>
                                <div>
                                    <p className="event-detail-label">Location</p>
                                    <p className="event-detail-value">{event.location}</p>
                                </div>
                            </div>

                            <div className="event-detail-item">
                                <i className="fa-solid fa-ticket"></i>
                                <div>
                                    <p className="event-detail-label">Admission</p>
                                    <p className="event-detail-value">{formattedCost}</p>
                                </div>
                            </div>

                            <div className="event-detail-item">
                                <i className="fa-solid fa-person"></i>
                                <div>
                                    <p className="event-detail-label">Organizer</p>
                                    <p className="event-detail-value">{event.organizerName || 'Unknown Organizer'}</p>
                                </div>
                            </div>

                            <div className="event-detail-item">
                                <i className="fa-solid fa-people-group"></i>
                                <div>
                                    <p className="event-detail-label">Capacity</p>
                                    <p className="event-detail-value">{`${attendanceCount}/${event.capacity} Attendees`}</p>
                                </div>
                            </div>
                        </div>

                        <div className="event-details-description">
                            <h3>Description:</h3>
                            <p>{event.description}</p>
                        </div>

                        <button
                            type="button"
                            className={actionClassName}
                            onClick={handleActionClick}
                            disabled={resolvedActionDisabled}
                        >
                            {actionLoading ? 'Saving...' : resolvedActionLabel}
                        </button>
                        {actionError ? <p className="event-details-action-error">{actionError}</p> : null}
                        {internalActionError ? <p className="event-details-action-error">{internalActionError}</p> : null}

                        <CommentSection parentType="event" parentId={event._id} pageSize={5} />
                    </div>
                </section>
            </main>
        </div>
    )
}
