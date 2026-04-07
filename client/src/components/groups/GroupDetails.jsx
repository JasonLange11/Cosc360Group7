import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import '@fortawesome/fontawesome-free/css/all.min.css'
import { getGroupById, joinGroup, leaveGroup } from '../../lib/groupsApi'
import './css/GroupDetails.css'

export default function GroupDetails({
    groupId,
    onClose,
    actionLabel = 'Sign up for this group',
    onAction,
    onMembershipChange,
    actionClassName = 'group-details-button',
    actionDisabled = false,
    actionError = '',
}) {
    const { currentUser } = useAuth()
    const [group, setGroup] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [actionLoading, setActionLoading] = useState(false)
    const [internalActionError, setInternalActionError] = useState('')

    useEffect(() => {
        function handleEscape(groupKey) {
            if (groupKey.key === 'Escape' && typeof onClose === 'function') {
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

        async function loadGroup() {
            try {
                setLoading(true)
                const groupData = await getGroupById(groupId)

                if (isMounted) {
                    setGroup(groupData)
                    setError(null)
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.message || 'Failed to load group details')
                    setGroup(null)
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

    if (loading) {
        return (
            <div className="group-details-overlay" onClick={onClose}>
                <div className="group-details-shell" onClick={(clickGroup) => clickGroup.stopPropagation()}>
                    Loading group details...
                </div>
            </div>
        )
    }

    if (error || !group) {
        return (
            <div className="group-details-overlay" onClick={onClose}>
                <main
                    className="group-details-shell group-details-error"
                    onClick={(clickGroup) => clickGroup.stopPropagation()}
                >
                    {error || 'Group not found'}
                </main>
            </div>
        )
    }
    const groupTags = Array.isArray(group.tags) ? group.tags : [];
    const isMember = Boolean(
        currentUser && Array.isArray(group.members) && group.members.some((memberId) => memberId.toString() === currentUser.id.toString())
    )
    const defaultActionLabel = currentUser ? (isMember ? 'Leave group' : 'Join Group') : 'Login to register'
    const resolvedActionLabel = onAction ? actionLabel : defaultActionLabel
    const resolvedActionDisabled = actionDisabled || (!onAction && !isMember)

    const handleActionClick = async () => {
            setInternalActionError('')
    
            if (typeof onAction === 'function') {
                await onAction(group)
                return
            }
    
            if (!currentUser) {
                setInternalActionError('You must be logged in to register for an event.')
                return
            }
    
            try {
                setActionLoading(true)
                const updatedGroup = isMember ? await leaveGroup(group._id) : await joinGroup(group._id)
                setGroup(updatedGroup)
    
                if (typeof onMembershipChange === 'function') {
                    onMembershipChange(updatedGroup)
                }
            } catch (err) {
                setInternalActionError(err.message || 'Failed to update membership.')
            } finally {
                setActionLoading(false)
            }
        }

    return (
        <div className="group-details-overlay" onClick={onClose}>
            <main className="group-details-shell" onClick={(clickGroup) => clickGroup.stopPropagation()}>
                <section className="group-details-card">
                    <div className="group-details-image-wrap">
                        <img src={group.bannerImage} alt={group.name} className="group-details-image" />
                        {groupTags.length > 0 ? (
                            <div className="group-details-tags">
                              {groupTags.map((tag) => (
                                <span key={tag} className="group-details-tag">{tag}</span>
                            ))}
                        </div>
                        ) : null}
                    </div>

                    <div className="group-details-content">
                        <h2 className="group-details-title">{group.name}</h2>

                        <div className="group-details-grid">
                            <div className="group-detail-item">
                                <i className="fa-solid fa-location-dot"></i>
                                <div>
                                    <p className="group-detail-label">Location</p>
                                    <p className="group-detail-value">{group.location}</p>
                                </div>
                            </div>

                            <div className="group-detail-item">
                                <i className="fa-solid fa-person"></i>
                                <div>
                                    <p className="group-detail-label">Organizer</p>
                                    <p className="group-detail-value">{group.organizerName || 'Unknown Organizer'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="group-details-description">
                            <h3>Description:</h3>
                            <p>{group.description}</p>
                        </div>

                        <button
                            type="button"
                            className={actionClassName}
                            onClick={handleActionClick}
                            disabled={resolvedActionDisabled}
                        >
                            {actionLoading ? 'Saving...' : resolvedActionLabel}
                        </button>
                        {actionError ? <p className="group-details-action-error">{actionError}</p> : null}
                        {internalActionError ? <p className="group-details-action-error">{internalActionError}</p> : null}
                    </div>
                </section>
            </main>
        </div>
    )
}