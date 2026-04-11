import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import '@fortawesome/fontawesome-free/css/all.min.css'
import { getGroupById, joinGroup, leaveGroup } from '../../lib/groupsApi'
import { createFlag } from '../../lib/flagsApi.js'
import { usePopup } from '../ui/PopupProvider'
import CommentSection from '../comments/CommentSection'
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
    const { showPrompt, showToast } = usePopup()
    const [group, setGroup] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [actionLoading, setActionLoading] = useState(false)
    const [flagBusy, setFlagBusy] = useState(false)

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
    const adminCannotJoin = Boolean(currentUser?.isAdmin && !isMember)
    const defaultActionLabel = currentUser ? (isMember ? 'Leave group' : (adminCannotJoin ? 'Admins cannot join groups' : 'Join Group')) : 'Login to join'
    const resolvedActionLabel = onAction ? actionLabel : defaultActionLabel
    const resolvedActionDisabled = actionDisabled || actionLoading || (!onAction && adminCannotJoin)

    const handleActionClick = async () => {
            if (typeof onAction === 'function') {
                await onAction(group)
                return
            }
    
            if (!currentUser) {
                showToast({
                    type: 'error',
                    title: 'Login Required',
                    message: 'You must be logged in to join a group.',
                })
                return
            }

            if (currentUser.isAdmin && !isMember) {
                showToast({
                    type: 'error',
                    title: 'Action Not Allowed',
                    message: 'Admins cannot join groups.',
                })
                return
            }
    
            try {
                setActionLoading(true)
                const updatedGroup = isMember ? await leaveGroup(group._id) : await joinGroup(group._id)
                setGroup(updatedGroup)
                showToast({
                    type: 'success',
                    title: isMember ? 'Left Group' : 'Joined Group',
                    message: isMember ? 'You have left this group.' : 'You have joined this group.',
                })
    
                if (typeof onMembershipChange === 'function') {
                    onMembershipChange(updatedGroup)
                }
            } catch (err) {
                showToast({
                    type: 'error',
                    title: 'Update Failed',
                    message: err.message || 'Failed to update membership.',
                })
            } finally {
                setActionLoading(false)
            }
        }

    const handleFlag = async () => {
            if (!currentUser) {
                showToast({
                    type: 'error',
                    title: 'Login Required',
                    message: 'You must be logged in to flag content.',
                })
                return
            }

            const reasonResponse = await showPrompt({
                title: 'Flag Group',
                message: 'Optional reason for flagging this group:',
                placeholder: 'Reason (optional)',
                confirmText: 'Submit Flag',
                cancelText: 'Cancel',
            })

            if (reasonResponse === null) {
                return
            }

            const reason = reasonResponse.trim()

            try {
                setFlagBusy(true)
                await createFlag({ targetType: 'group', targetId: group._id, reason })
                showToast({
                    type: 'success',
                    title: 'Flag Submitted',
                    message: 'Group flagged for admin review.',
                })
            } catch (err) {
                showToast({
                    type: 'error',
                    title: 'Flag Failed',
                    message: err.message || 'Failed to flag group.',
                })
            } finally {
                setFlagBusy(false)
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

                        <button
                            type="button"
                            className="group-details-button"
                            onClick={handleFlag}
                            disabled={flagBusy}
                            title="Flag group"
                            aria-label="Flag group"
                        >
                            <i className={`fa-regular ${flagBusy ? 'fa-hourglass-half' : 'fa-flag'}`}></i>
                            {flagBusy ? ' Flagging...' : ' Flag'}
                        </button>

                        <CommentSection parentType="group" parentId={group._id} pageSize={5} />
                    </div>
                </section>
            </main>
        </div>
    )
}