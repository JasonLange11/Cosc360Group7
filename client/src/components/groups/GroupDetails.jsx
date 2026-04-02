import { useEffect, useState } from 'react'
import '@fortawesome/fontawesome-free/css/all.min.css'
import { getGroupById } from '../../lib/groupsApi'
import './css/GroupDetails.css'

export default function GroupDetails({
    groupId,
    onClose,
    actionLabel = 'Sign up for this group',
    onAction,
    actionClassName = 'group-details-button',
    actionDisabled = false,
    actionError = '',
}) {
    const [group, setGroup] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

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

    const handleActionClick = async () => {
        if (typeof onAction === 'function') {
            await onAction(group)
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
                            disabled={actionDisabled}
                        >
                            {actionLabel}
                        </button>
                        {actionError ? <p className="group-details-action-error">{actionError}</p> : null}
                    </div>
                </section>
            </main>
        </div>
    )
}