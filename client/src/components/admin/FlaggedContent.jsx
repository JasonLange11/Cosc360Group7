import { useEffect, useMemo, useState } from 'react'
import SearchBar from '../search/SearchBar'
import { approveFlag, getFlags, removeFlaggedTarget } from '../../lib/flagsApi.js'
import { usePopup } from '../ui/PopupProvider'
import './css/FlaggedContent.css'

function matchesFilter(flag, selectedFilter) {
	const normalizedFilter = String(selectedFilter || '').trim().toLowerCase()
	const normalizedStatus = String(flag?.status || '').trim().toLowerCase()

	if (!normalizedFilter || normalizedFilter === 'all') {
		return true
	}

	return normalizedStatus === normalizedFilter
}

export default function FlaggedContent({ compact = false, onMore, selectedFilter = 'open' }) {
	const { showConfirm } = usePopup()
	const [searchTerm, setSearchTerm] = useState('')
	const [items, setItems] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [activeFlag, setActiveFlag] = useState(null)
	const [actionBusy, setActionBusy] = useState(false)

	useEffect(() => {
		let isMounted = true

		async function loadFlags() {
			try {
				setLoading(true)
				const flags = await getFlags()

				if (!isMounted) {
					return
				}

				setItems(Array.isArray(flags) ? flags : [])
				setError('')
			} catch (err) {
				if (!isMounted) {
					return
				}

				setItems([])
				setError(err.message || 'Failed to load flagged content')
			} finally {
				if (isMounted) {
					setLoading(false)
				}
			}
		}

		loadFlags()

		return () => {
			isMounted = false
		}
	}, [])

	const filteredItems = useMemo(() => {
		const scopedItems = items.filter((item) => matchesFilter(item, selectedFilter))

		if (!searchTerm.trim()) {
			return scopedItems
		}

		const term = searchTerm.toLowerCase()
		return scopedItems.filter((flag) => {
			const title = String(flag?.target?.title || '').toLowerCase()
			const preview = String(flag?.target?.preview || '').toLowerCase()
			const reason = String(flag?.reason || '').toLowerCase()
			const reporter = String(flag?.reporterName || '').toLowerCase()

			return title.includes(term) || preview.includes(term) || reason.includes(term) || reporter.includes(term)
		})
	}, [items, searchTerm, selectedFilter])

	const visibleItems = compact ? filteredItems.slice(0, 4) : filteredItems

	const emitOpenFlagDelta = (previousStatus, nextStatus) => {
		const previousOpen = previousStatus === 'open'
		const nextOpen = nextStatus === 'open'

		if (previousOpen === nextOpen) {
			return
		}

		window.dispatchEvent(
			new CustomEvent('admin:open-flag-count-delta', {
				detail: {
					delta: nextOpen ? 1 : -1,
				},
			})
		)
	}

	const handleApprove = async (flagId) => {
		try {
			setActionBusy(true)
			const currentFlag = items.find((item) => item._id === flagId)
			const updatedFlag = await approveFlag(flagId)
			setItems((currentItems) => currentItems.map((item) => (item._id === flagId ? { ...item, ...updatedFlag } : item)))
			setActiveFlag((currentFlag) => (currentFlag?._id === flagId ? { ...currentFlag, ...updatedFlag } : currentFlag))
			emitOpenFlagDelta(currentFlag?.status, updatedFlag?.status)
			setError('')
		} catch (err) {
			setError(err.message || 'Failed to approve flag')
		} finally {
			setActionBusy(false)
		}
	}

	const handleRemoveTarget = async (flagId) => {
		const currentFlag = items.find((item) => item._id === flagId)
		const confirmed = await showConfirm({
			title: 'Remove Flagged Content',
			message: `Are you sure you want to remove this ${currentFlag?.targetType || 'item'}?`,
			confirmText: 'Remove',
			cancelText: 'Cancel',
		})

		if (!confirmed) {
			return
		}

		try {
			setActionBusy(true)
			const updatedFlag = await removeFlaggedTarget(flagId)
			setItems((currentItems) => currentItems.map((item) => (item._id === flagId ? { ...item, ...updatedFlag } : item)))
			setActiveFlag((currentFlag) => (currentFlag?._id === flagId ? { ...currentFlag, ...updatedFlag } : currentFlag))
			emitOpenFlagDelta(currentFlag?.status, updatedFlag?.status)
			setError('')
		} catch (err) {
			setError(err.message || 'Failed to remove flagged target')
		} finally {
			setActionBusy(false)
		}
	}

	const renderStatus = (status) => {
		if (status === 'approved') {
			return 'Approved'
		}

		if (status === 'removed') {
			return 'Removed'
		}

		return 'Open'
	}

	return (
		<section className={`a-panel ${compact ? 'a-compact' : 'a-full'}`}>
			<header className="a-head">
				<h3>Flagged Content</h3>
				{compact && onMore ? (
					<button type="button" className="a-link" onClick={onMore}>
						More &gt;
					</button>
				) : null}
			</header>

			<SearchBar
				onSearch={setSearchTerm}
				title=""
				placeholder="Search content"
				buttonLabel="Search"
				variant="compact"
				clearOnSearch={false}
				initialValue={searchTerm}
				inputAriaLabel="Search flagged content"
			/>

			<div className="a-list">
				{error ? <p className="a-empty">{error}</p> : null}
				{loading ? <p className="a-empty">Loading flagged content...</p> : null}
				{!loading && visibleItems.length === 0 ? (
					<p className="a-empty">No flagged content found.</p>
				) : (
					visibleItems.map((flag) => (
						<article className="a-row" key={flag._id}>
							<div className="a-main">
								<span className="a-icon">
									<i className="fa-solid fa-magnifying-glass"></i>
								</span>
								<div>
									<strong>{flag?.target?.title || 'Flagged item'}</strong>
									<p>{(flag?.target?.preview || '').slice(0, 100) || 'No preview available.'}</p>
									<p className="a-flag-meta">Type: {flag.targetType} | Status: {renderStatus(flag.status)} | Reporter: {flag.reporterName}</p>
								</div>
							</div>

							<div className="a-actions">
								<button type="button" className="btn-secondary" onClick={() => setActiveFlag(flag)}>Details</button>
								<button type="button" className="btn-success" onClick={() => handleApprove(flag._id)} disabled={actionBusy || flag.status !== 'open'}>
									{actionBusy && activeFlag?._id === flag._id ? 'Saving...' : 'Approve'}
								</button>
								<button type="button" className="btn-danger" onClick={() => handleRemoveTarget(flag._id)} disabled={actionBusy || flag.status !== 'open'}>
									{actionBusy && activeFlag?._id === flag._id ? 'Saving...' : `Remove ${flag.targetType}`}
								</button>
							</div>
						</article>
					))
				)}
			</div>

			{activeFlag ? (
				<div className="a-flag-modal-overlay" onClick={() => setActiveFlag(null)}>
					<section className="a-flag-modal" onClick={(event) => event.stopPropagation()}>
						<header className="a-head">
							<h3>Flag Details</h3>
							<button type="button" className="a-link" onClick={() => setActiveFlag(null)}>Close</button>
						</header>
						<p><strong>Type:</strong> {activeFlag.targetType}</p>
						<p><strong>Status:</strong> {renderStatus(activeFlag.status)}</p>
						<p><strong>Reporter:</strong> {activeFlag.reporterName}</p>
						<p><strong>Reported At:</strong> {new Date(activeFlag.createdAt).toLocaleString()}</p>
						<p><strong>Reason:</strong> {activeFlag.reason || 'No reason provided.'}</p>
						<p><strong>Target Owner:</strong> {activeFlag?.target?.ownerName || 'Unknown'}</p>
						<p><strong>Target Title:</strong> {activeFlag?.target?.title || 'N/A'}</p>
						<p><strong>Target Preview:</strong> {activeFlag?.target?.preview || 'No preview available.'}</p>

						<div className="a-actions">
							<button type="button" className="btn-success" onClick={() => handleApprove(activeFlag._id)} disabled={actionBusy || activeFlag.status !== 'open'}>
								Approve
							</button>
							<button type="button" className="btn-danger" onClick={() => handleRemoveTarget(activeFlag._id)} disabled={actionBusy || activeFlag.status !== 'open'}>
								Remove {activeFlag.targetType}
							</button>
						</div>
					</section>
				</div>
			) : null}
		</section>
	)
}
