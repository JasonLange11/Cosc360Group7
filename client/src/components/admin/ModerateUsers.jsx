import { useEffect, useMemo, useState } from 'react'
import SearchBar from '../search/SearchBar'
import { getUsers, deleteUser } from '../../lib/usersApi'
import React from 'react'
import './css/ModerateUsers.css'

export default function ModerateUsers({ compact = false, onMore }){
    const [users, setUsers] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [deletingUserId, setDeletingUserId] = useState('')
    const [removeError, setRemoveError] = useState('')

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
        if (!searchTerm.trim()) {
            return users
        }

        const term = searchTerm.toLowerCase()

        return users.filter((user) => {
            const name = String(user.name || '').toLowerCase()
            const email = String(user.email || '').toLowerCase()

            return name.includes(term) || email.includes(term)
        })
    }, [users, searchTerm])

    const visibleUsers = compact ? filteredUsers.slice(0, 6) : filteredUsers

    const getUserId = (user) => user.id || user._id || ''

    const handleRemoveUser = async (userId) => {
        if (!userId) {
            return
        }

        if(window.confirm("Are you sure you want to delete: " + (users.find(user => (user._id || user.id) === userId)).name)){
            try {
                setDeletingUserId(userId)
                setRemoveError('')
                await deleteUser(userId)
                setUsers((currentUsers) => currentUsers.filter((user) => getUserId(user) !== userId))
            } catch (error) {
                setRemoveError(error.message || 'Failed to remove user')
            } finally {
                setDeletingUserId('')
            }
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
                                </div>
                            </div>

                            <div className="a-actions">
                                <button type="button" className="btn-secondary" disabled>Details</button>
                                <button
                                    type="button"
                                    className="btn-danger"
                                    onClick={() => handleRemoveUser(getUserId(user))}
                                    disabled={deletingUserId === getUserId(user)}
                                >
                                    {deletingUserId === getUserId(user) ? 'Removing...' : 'Remove'}
                                </button>
                            </div>
                        </article>
                    ))
                )}
            </div>
        </section>
    )
}