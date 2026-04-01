import { useMemo, useState } from 'react'
import SearchBar from '../search/SearchBar'
import './css/PendingReviews.css'

export default function PendingReviews({ compact = false, onMore, items = [] }) {
	const [searchTerm, setSearchTerm] = useState('')

	const filteredItems = useMemo(() => {
		if (!searchTerm.trim()) {
			return items
		}

		const term = searchTerm.toLowerCase()
		return items.filter((review) => String(review.text).toLowerCase().includes(term))
	}, [items, searchTerm])

	const visibleItems = compact ? filteredItems.slice(0, 4) : filteredItems

	return (
		<section className={`a-panel ${compact ? 'a-compact' : 'a-full'}`}>
			<header className="a-head">
				<h3>Pending Reviews</h3>
				{compact && onMore ? (
					<button type="button" className="a-link" onClick={onMore}>
						More &gt;
					</button>
				) : null}
			</header>

			<SearchBar
				onSearch={setSearchTerm}
				title=""
				placeholder="Search reviews"
				buttonLabel="Search"
				variant="compact"
				clearOnSearch={false}
				initialValue={searchTerm}
				inputAriaLabel="Search pending reviews"
			/>

			<div className="a-list">
				{visibleItems.length === 0 ? (
					<p className="a-empty">No pending reviews found.</p>
				) : (
					visibleItems.map((review) => (
						<article className="a-row" key={review.id}>
							<div className="a-main">
								<span className="a-icon">
									<i className="fa-solid fa-magnifying-glass"></i>
								</span>
								<div>
									<strong>{review.text}</strong>
								</div>
							</div>

							<div className="a-actions">
								<button type="button" className="btn-secondary">Details</button>
								<button type="button" className="btn-success">Approve</button>
								<button type="button" className="btn-danger">Remove</button>
							</div>
						</article>
					))
				)}
			</div>
		</section>
	)
}
