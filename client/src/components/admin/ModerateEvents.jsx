import { useEffect, useMemo, useState } from 'react'
import SearchBar from '../search/SearchBar'
import CardDisplay from '../events/CardDisplay'
import EventDetails from '../events/EventDetails'
import { deleteEvent, getEvents } from '../../lib/eventsApi'
import './css/ModerateEvents.css'

function getEventId(event) {
	return event.id || event._id || event.title
}

export default function ModerateEvents({ compact = false, onMore }) {
	const [events, setEvents] = useState([])
	const [searchTerm, setSearchTerm] = useState('')
	const [loading, setLoading] = useState(true)
	const [activeEventId, setActiveEventId] = useState(null)
	const [isRemoving, setIsRemoving] = useState(false)
	const [removeError, setRemoveError] = useState('')

	useEffect(() => {
		const fetchEvents = async () => {
			try {
				const eventsData = await getEvents()
				setEvents(eventsData)
			} catch (error) {
				console.log('Failed to fetch events', error)
			} finally {
				setLoading(false)
			}
		}

		fetchEvents()
	}, [])

	const filteredEvents = useMemo(() => {
		if (!searchTerm.trim()) {
			return events
		}

		const term = searchTerm.toLowerCase()

		return events.filter((event) => {
			const title = String(event.title || '').toLowerCase()
			const location = String(event.location || '').toLowerCase()
			const description = String(event.description || '').toLowerCase()

			return title.includes(term) || location.includes(term) || description.includes(term)
		})
	}, [events, searchTerm])

	const visibleEvents = compact ? filteredEvents.slice(0, 4) : filteredEvents

	const handleRemoveEvent = async () => {
		if (!activeEventId) {
			return
		}

		if(window.confirm("Are you sure you want to remove this event?")){
			try {
				setIsRemoving(true)
				setRemoveError('')
				await deleteEvent(activeEventId)
				setEvents((currentEvents) => currentEvents.filter((event) => getEventId(event) !== activeEventId))
				setActiveEventId(null)
			} catch (error) {
				setRemoveError(error.message || 'Failed to remove event')
			} finally {
				setIsRemoving(false)
			}
		}
	}

	const handleCloseDetails = () => {
		setActiveEventId(null)
		setRemoveError('')
	}

	return (
		<section className={`a-panel ${compact ? 'a-compact' : 'a-full'}`}>
			<header className="a-head">
				<h3>Moderate Events</h3>
				{compact && onMore ? (
					<button type="button" className="a-link" onClick={onMore}>
						More &gt;
					</button>
				) : null}
			</header>

			<SearchBar
				onSearch={setSearchTerm}
				title=""
				placeholder="Search events"
				buttonLabel="Search"
				variant="compact"
				clearOnSearch={false}
				initialValue={searchTerm}
				inputAriaLabel="Search events"
			/>

			<div className={compact ? 'a-grid a-grid-c' : 'a-grid'}>
				{loading ? (
					<p className="a-empty">Loading events...</p>
				) : visibleEvents.length === 0 ? (
					<p className="a-empty">No events found.</p>
				) : (
					visibleEvents.map((event) => {
						const eventId = getEventId(event)

						return (
							<CardDisplay
								key={eventId}
								eventId={eventId}
								onOpenEvent={setActiveEventId}
								img={{
									src: event.bannerImage,
									alt: event.title,
								}}
								heading={event.title}
								details={[
									['fa-calendar', new Date(event.eventDate).toLocaleDateString()],
									['fa-clock', event.eventTime || 'Time TBD'],
									['fa-location-dot', event.location || 'Location TBD'],
								]}
								description={event.description || 'No description available.'}
							/>
						)
					})
				)}
			</div>

			{activeEventId ? (
				<EventDetails
					eventId={activeEventId}
					onClose={handleCloseDetails}
					actionLabel={isRemoving ? 'Removing...' : 'Remove event'}
					onAction={handleRemoveEvent}
					actionClassName="event-details-button event-details-button--danger"
					actionDisabled={isRemoving}
					actionError={removeError}
					enableTagEdit={true}
				/>
			) : null}
		</section>
	)
}
