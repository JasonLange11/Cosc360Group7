import { useEffect, useMemo, useState } from 'react'
import SearchBar from '../search/SearchBar'
import { useAuth } from '../../context/AuthContext.jsx'
import { getUsers, deleteUser, updateUserStatus } from '../../lib/usersApi'
import AdminUserDetailsModal from './AdminUserDetailsModal.jsx'
import { usePopup } from '../ui/PopupProvider'
import './css/ModerateUsers.css'

export default function ModerateUsers({ compact = false, onMore, selectedFilter = 'users' }){
    const { currentUser } = useAuth()
    const { showConfirm, showToast } = usePopup()
    const [users, setUsers] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [deletingUserId, setDeletingUserId] = useState('')
    const [updatingUserId, setUpdatingUserId] = useState('')
    const [removeError, setRemoveError] = useState('')
    const [activeUser, setActiveUser] = useState(null)

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersData = await getUsers()
                setUsers(usersData)

            } catch (error) {
                console.log('Failed to fetch users', error)
            } finally {
                setLoading(false)
            }
        }

        fetchUsers()
    }, [])

    const filteredUsers = useMemo(() => {
		const usersByRole = users.filter((user) => {
			if (selectedFilter === 'users') {
				return !user.isAdmin
			}

			if (selectedFilter === 'admins') {
				return Boolean(user.isAdmin)
			}

			return true
		})

        if (!searchTerm.trim()) {
            return usersByRole
        }

        const term = searchTerm.toLowerCase()

        return usersByRole.filter((user) => {
            const name = String(user.name || '').toLowerCase()
            const email = String(user.email || '').toLowerCase()

            return name.includes(term) || email.includes(term)
        })
    }, [users, searchTerm, selectedFilter])

    const visibleUsers = compact ? filteredUsers.slice(0, 4) : filteredUsers

    const getUserId = (user) => user.id || user._id || ''

    const handleUserUpdated = (updatedUser) => {
        setUsers((currentUsers) => currentUsers.map((currentUser) => (
            getUserId(currentUser) === getUserId(updatedUser) ? { ...currentUser, ...updatedUser } : currentUser
        )))
        setActiveUser((currentUser) => {
            if (!currentUser || getUserId(currentUser) !== getUserId(updatedUser)) {
                return currentUser
            }

            return { ...currentUser, ...updatedUser }
        })
    }

    const handleRemoveUser = async (userId) => {
        if (!userId) {
            return
        }

        const targetUser = users.find((user) => (user._id || user.id) === userId)
        const confirmed = await showConfirm({
            title: 'Remove User',
            message: `Are you sure you want to delete ${targetUser?.name || 'this user'}?`,
            confirmText: 'Remove',
            cancelText: 'Cancel',
        })

        if (!confirmed) {
            return
        }

        try {
            setDeletingUserId(userId)
            setRemoveError('')
            await deleteUser(userId)
            setUsers((currentUsers) => currentUsers.filter((user) => getUserId(user) !== userId))
            window.dispatchEvent(new CustomEvent('admin:user-removed'))
            showToast({
                type: 'success',
                title: 'User Removed',
                message: 'The user was removed successfully.',
            })
        } catch (error) {
            setRemoveError(error.message || 'Failed to remove user')
            showToast({
                type: 'error',
                title: 'Remove Failed',
                message: error.message || 'Failed to remove user',
            })
        } finally {
            setDeletingUserId('')
        }
    }

    const handleToggleUserStatus = async (user) => {
        const userId = getUserId(user)

        if (!userId) {
            return
        }

        const nextDisabledState = !Boolean(user.isDisabled)
        const actionLabel = nextDisabledState ? 'disable' : 'activate'

        const confirmed = await showConfirm({
            title: `${nextDisabledState ? 'Disable' : 'Activate'} User`,
            message: `Are you sure you want to ${actionLabel} ${user.name}?`,
            confirmText: nextDisabledState ? 'Disable' : 'Activate',
            cancelText: 'Cancel',
        })

        if (!confirmed) {
            return
        }

        try {
            setUpdatingUserId(userId)
            setRemoveError('')
            const updatedUser = await updateUserStatus(userId, nextDisabledState)
                handleUserUpdated(updatedUser)
        } catch (error) {
            setRemoveError(error.message || 'Failed to update user status')
            showToast({
                type: 'error',
                title: 'Update Failed',
                message: error.message || 'Failed to update user status',
            })
        } finally {
            setUpdatingUserId('')
        }
    }

    return(
        <section className={`a-panel ${compact ? 'a-compact' : 'a-full'}`}>
            <header className="a-head">
                <h3>Moderate Users</h3>
                {compact && onMore ? (
                    <button type="button" className="a-link" onClick={onMore}>
                        More &gt;
                    </button>
                ) : null}
            </header>

            <SearchBar
                onSearch={setSearchTerm}
                title=""
                placeholder="Search users"
                buttonLabel="Search"
                variant="compact"
                clearOnSearch={false}
                initialValue={searchTerm}
                inputAriaLabel="Search users"
            />

            <div className="a-list">
                {removeError ? <p className="a-empty">{removeError}</p> : null}
                {loading ? (
                    <p className="a-empty">Loading users...</p>
                ) : visibleUsers.length === 0 ? (
                    <p className="a-empty">No users found.</p>
                ) : (
                    visibleUsers.map((user) => (
                        <article className="a-row" key={getUserId(user) || user.email}>
                            <div className="a-main">
                                <span className="a-icon">
                                    <i className="fa-regular fa-circle-user"></i>
                                </span>
                                <div>
                                    <strong>{user.name || 'Unnamed User'}</strong>
                                    <p>{user.email || 'No email provided'}</p>
                                    <p className={`a-user-status ${user.isDisabled ? 'is-disabled' : 'is-active'}`}>
                                        {user.isDisabled ? 'Disabled' : 'Active'}
                                    </p>
                                </div>
                            </div>

                            <div className="a-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setActiveUser(user)}
                                    disabled={deletingUserId === getUserId(user) || updatingUserId === getUserId(user)}
                                >
                                    Details
                                </button>
                                <button
                                    type="button"
                                    className={user.isDisabled ? 'btn-success' : 'btn-secondary'}
                                    onClick={() => handleToggleUserStatus(user)}
                                    disabled={
                                        updatingUserId === getUserId(user)
                                        || deletingUserId === getUserId(user)
                                        || user.isAdmin
                                    }
                                >
                                    {updatingUserId === getUserId(user)
                                        ? 'Saving...'
                                        : (user.isDisabled ? 'Activate' : 'Disable')}
                                </button>
                                <button
                                    type="button"
                                    className="btn-danger"
                                    onClick={() => handleRemoveUser(getUserId(user))}
                                    disabled={
                                        deletingUserId === getUserId(user)
                                        || updatingUserId === getUserId(user)
                                        || user.isAdmin
                                        || String(currentUser?.id || '') === String(getUserId(user))
                                    }
                                >
                                    {deletingUserId === getUserId(user) ? 'Removing...' : 'Remove'}
                                </button>
                            </div>
                        </article>
                    ))
                )}
            </div>

            {activeUser ? (
                <AdminUserDetailsModal
                    user={activeUser}
                    onClose={() => setActiveUser(null)}
                    onUserUpdated={handleUserUpdated}
                />
            ) : null}
        </section>
    )
}