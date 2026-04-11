
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../search/SearchBar'
import CardDisplay from '../ui/CardDisplay'
import GroupDetails from '../groups/GroupDetails'
import { deleteGroup, getGroups } from '../../lib/groupsApi'
import './css/ModerateEvents.css'

function getGroupId(group) {
    return group.id || group._id || group.name
}

export default function ModerateGroups({ compact = false, onMore }) {
    const navigate = useNavigate()
    const [groups, setGroups] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [activeGroupId, setActiveGroupId] = useState(null)
    const [isRemoving, setIsRemoving] = useState(false)
    const [removeError, setRemoveError] = useState('')

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const groupsData = await getGroups()
                setGroups(groupsData)
            } catch (error) {
                console.log('Failed to fetch groups', error)
            } finally {
                setLoading(false)
            }
        }

        fetchGroups()
    }, [])

    const filteredGroups = useMemo(() => {
        if (!searchTerm.trim()) {
            return groups
        }

        const term = searchTerm.toLowerCase()

        return groups.filter((group) => {
            const name = String(group.name || '').toLowerCase()
            const location = String(group.location || '').toLowerCase()
            const description = String(group.description || '').toLowerCase()

            return name.includes(term) || location.includes(term) || description.includes(term)
        })
    }, [groups, searchTerm])

    const visibleGroups = compact ? filteredGroups.slice(0, 4) : filteredGroups

    const handleRemoveGroup = async () => {
        if (!activeGroupId) {
            return
        }

        if (window.confirm('Are you sure you want to remove this group?')) {
            try {
                setIsRemoving(true)
                setRemoveError('')
                await deleteGroup(activeGroupId)
                setGroups((currentGroups) => currentGroups.filter((group) => getGroupId(group) !== activeGroupId))
                setActiveGroupId(null)
            } catch (error) {
                setRemoveError(error.message || 'Failed to remove group')
            } finally {
                setIsRemoving(false)
            }
        }
    }

    const handleCloseDetails = () => {
        setActiveGroupId(null)
        setRemoveError('')
    }

    return (
        <section className={`a-panel ${compact ? 'a-compact' : 'a-full'}`}>
            <header className="a-head">
                <h3>Moderate Groups</h3>
                {compact && onMore ? (
                    <button type="button" className="a-link" onClick={onMore}>
                        More &gt;
                    </button>
                ) : null}
            </header>

            <SearchBar
                onSearch={setSearchTerm}
                title=""
                placeholder="Search groups"
                buttonLabel="Search"
                variant="compact"
                clearOnSearch={false}
                initialValue={searchTerm}
                inputAriaLabel="Search groups"
            />

            <div className={compact ? 'a-grid a-grid-c' : 'a-grid'}>
                {loading ? (
                    <p className="a-empty">Loading groups...</p>
                ) : visibleGroups.length === 0 ? (
                    <p className="a-empty">No groups found.</p>
                ) : (
                    visibleGroups.map((group) => {
                        const groupId = getGroupId(group)

                        return (
                            <div key={groupId} className="a-event-item">
                                <CardDisplay
                                    groupId={groupId}
                                    onOpenGroup={setActiveGroupId}
                                    img={{
                                        src: group.bannerImage,
                                        alt: group.name,
                                    }}
                                    heading={group.name}
                                    details={[
                                        ['fa-location-dot', group.location || 'Location TBD'],
                                        ['fa-person', group.organizerName || 'Organizer TBD'],
                                    ]}
                                    description={group.description || 'No description available.'}
                                />
                                <button
                                    type="button"
                                    className="a-edit-button"
                                    onClick={() => navigate(`/groups/${groupId}/edit`)}
                                >
                                    Edit Group
                                </button>
                            </div>
                        )
                    })
                )}
            </div>

            {activeGroupId ? (
                <GroupDetails
                    groupId={activeGroupId}
                    onClose={handleCloseDetails}
                    actionLabel={isRemoving ? 'Removing...' : 'Remove group'}
                    onAction={handleRemoveGroup}
                    actionClassName="group-details-button group-details-button--danger"
                    actionDisabled={isRemoving}
                    actionError={removeError}
                />
            ) : null}
        </section>
    )
}