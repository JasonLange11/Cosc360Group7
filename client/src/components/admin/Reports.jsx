import { useEffect, useMemo, useState } from 'react'
import { getEvents } from '../../lib/eventsApi'
import { getUsers } from '../../lib/usersApi'
import './css/Reports.css'

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const REPORT_COPY = {
	attendance: {
		title: 'Total Attendance',
		description: 'Total registrations grouped by the month the event takes place.',
		icon: 'fa-solid fa-user-check',
		accentClass: 'r-card-attendance',
	},
	'unique-attendees': {
		title: 'Unique Attendees',
		description: 'Distinct users attending events, grouped by the month the event takes place.',
		icon: 'fa-solid fa-users-viewfinder',
		accentClass: 'r-card-unique',
	},
	'events-created': {
		title: 'Events Created',
		description: 'Events grouped by the month they were created.',
		icon: 'fa-solid fa-calendar-plus',
		accentClass: 'r-card-events',
	},
	'users-created': {
		title: 'Users Created',
		description: 'User accounts grouped by the month they were created.',
		icon: 'fa-solid fa-user-plus',
		accentClass: 'r-card-users',
	},
}

function getMonthCounts(items, dateField, year, getValue = () => 1) {
	const monthlyCounts = Array(12).fill(0)

	items.forEach((item) => {
		const rawDate = item?.[dateField]

		if (!rawDate) {
			return
		}

		const parsedDate = new Date(rawDate)

		if (Number.isNaN(parsedDate.getTime()) || parsedDate.getFullYear() !== year) {
			return
		}

		monthlyCounts[parsedDate.getMonth()] += getValue(item)
	})

	return monthlyCounts
}

function getUniqueAttendeeStats(events, year) {
	const monthlySets = Array.from({ length: 12 }, () => new Set())
	const yearlyUniqueAttendees = new Set()
	let totalAttendance = 0

	events.forEach((event) => {
		const rawDate = event?.eventDate

		if (!rawDate) {
			return
		}

		const parsedDate = new Date(rawDate)

		if (Number.isNaN(parsedDate.getTime()) || parsedDate.getFullYear() !== year) {
			return
		}

		const attendeeIds = Array.isArray(event.attendees) ? event.attendees : []
		totalAttendance += attendeeIds.length

		attendeeIds.forEach((attendeeId) => {
			const normalizedId = String(attendeeId)
			monthlySets[parsedDate.getMonth()].add(normalizedId)
			yearlyUniqueAttendees.add(normalizedId)
		})
	})

	return {
		monthlyCounts: monthlySets.map((monthSet) => monthSet.size),
		totalUniqueAttendees: yearlyUniqueAttendees.size,
		averageEventsPerAttendee: yearlyUniqueAttendees.size === 0 ? 0 : totalAttendance / yearlyUniqueAttendees.size,
	}
}

function getAvailableYears(events, users) {
	const years = new Set()

	events.forEach((event) => {
		if (event.eventDate) {
			years.add(new Date(event.eventDate).getFullYear())
		}

		if (event.createdAt) {
			years.add(new Date(event.createdAt).getFullYear())
		}
	})

	users.forEach((user) => {
		if (user.createdAt) {
			years.add(new Date(user.createdAt).getFullYear())
		}
	})

	return [...years].filter((year) => Number.isFinite(year)).sort((left, right) => right - left)
}

export default function Reports({ compact = false, onMore, selectedFilter = 'attendance' }) {
	const [events, setEvents] = useState([])
	const [users, setUsers] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

	useEffect(() => {
		const loadReportData = async () => {
			try {
				setLoading(true)
				const [eventsData, usersData] = await Promise.all([
					getEvents({ status: 'all', includeAuth: true }),
					getUsers(),
				])

				setEvents(eventsData)
				setUsers(usersData)
				setError('')
			} catch (loadError) {
				setError(loadError.message || 'Failed to load reports data.')
				setEvents([])
				setUsers([])
			} finally {
				setLoading(false)
			}
		}

		loadReportData()
	}, [])

	const availableYears = useMemo(() => {
		const years = getAvailableYears(events, users)
		return years.length > 0 ? years : [new Date().getFullYear()]
	}, [events, users])

	useEffect(() => {
		if (!availableYears.includes(selectedYear)) {
			setSelectedYear(availableYears[0])
		}
	}, [availableYears, selectedYear])

	const monthlyCounts = useMemo(() => {
		if (selectedFilter === 'unique-attendees') {
			return getUniqueAttendeeStats(events, selectedYear).monthlyCounts
		}

		if (selectedFilter === 'events-created') {
			return getMonthCounts(events, 'createdAt', selectedYear)
		}

		if (selectedFilter === 'users-created') {
			return getMonthCounts(users, 'createdAt', selectedYear)
		}

		return getMonthCounts(events, 'eventDate', selectedYear, (event) => Array.isArray(event.attendees) ? event.attendees.length : 0)
	}, [events, users, selectedFilter, selectedYear])

	const uniqueAttendeeStats = useMemo(() => {
		return getUniqueAttendeeStats(events, selectedYear)
	}, [events, selectedYear])

	const totalCount = selectedFilter === 'unique-attendees'
		? uniqueAttendeeStats.totalUniqueAttendees
		: monthlyCounts.reduce((total, count) => total + count, 0)
	const maxCount = Math.max(...monthlyCounts, 1)
	const peakMonthIndex = monthlyCounts.findIndex((count) => count === Math.max(...monthlyCounts))
	const reportCopy = REPORT_COPY[selectedFilter] || REPORT_COPY.attendance
	const averageEventsPerAttendee = uniqueAttendeeStats.averageEventsPerAttendee.toFixed(1)

	if (loading) {
		return (
			<section className={`a-panel ${compact ? 'a-compact' : 'a-full'}`}>
				<header className="a-head">
					<h3>Reports</h3>
					{compact && onMore ? <button type="button" className="a-link" onClick={onMore}>More &gt;</button> : null}
				</header>
				<p className="a-empty">Loading reports...</p>
			</section>
		)
	}

	if (error) {
		return (
			<section className={`a-panel ${compact ? 'a-compact' : 'a-full'}`}>
				<header className="a-head">
					<h3>Reports</h3>
					{compact && onMore ? <button type="button" className="a-link" onClick={onMore}>More &gt;</button> : null}
				</header>
				<p className="a-empty">{error}</p>
			</section>
		)
	}

	if (compact) {
		return (
			<section className="a-panel a-compact">
				<header className="a-head">
					<h3>Reports</h3>
					{onMore ? <button type="button" className="a-link" onClick={onMore}>More &gt;</button> : null}
				</header>

				<article className={`r-summary-card ${reportCopy.accentClass}`}>
					<p className="r-summary-label"><i className={reportCopy.icon}></i>{reportCopy.title}</p>
					<strong className="r-summary-value">{totalCount}</strong>
					<p className="r-summary-meta">{selectedYear} total</p>
					<p className="r-summary-meta">Peak month: {peakMonthIndex >= 0 ? MONTH_LABELS[peakMonthIndex] : 'N/A'}</p>
				</article>
			</section>
		)
	}

	return (
		<section className="a-panel a-full">
			<header className="a-head">
				<div>
					<h3>Reports</h3>
					<p className="r-subtitle">{reportCopy.description}</p>
				</div>
				<label className="r-year-picker">
					<span>Year</span>
					<select value={selectedYear} onChange={(event) => setSelectedYear(Number(event.target.value))}>
						{availableYears.map((year) => (
							<option key={year} value={year}>{year}</option>
						))}
					</select>
				</label>
			</header>

			<section className="r-summary-grid">
				<article className={`r-summary-card ${reportCopy.accentClass}`}>
					<p className="r-summary-label"><i className={reportCopy.icon}></i>{reportCopy.title}</p>
					<strong className="r-summary-value">{totalCount}</strong>
					<p className="r-summary-meta">Total for {selectedYear}</p>
				</article>

				<article className="r-summary-card">
					{selectedFilter === 'unique-attendees' ? (
						<>
							<p className="r-summary-label"><i className="fa-solid fa-arrows-rotate"></i>Average Events Per Attendee</p>
							<strong className="r-summary-value">{averageEventsPerAttendee}</strong>
							<p className="r-summary-meta">Based on total registrations divided by unique attendees</p>
						</>
					) : (
						<>
							<p className="r-summary-label"><i className="fa-solid fa-arrow-trend-up"></i>Peak Month</p>
							<strong className="r-summary-value">{peakMonthIndex >= 0 ? MONTH_LABELS[peakMonthIndex] : 'N/A'}</strong>
							<p className="r-summary-meta">{peakMonthIndex >= 0 ? monthlyCounts[peakMonthIndex] : 0} in the busiest month</p>
						</>
					)}
				</article>
			</section>

			<section className="r-chart" aria-label={`${reportCopy.title} by month for ${selectedYear}`}>
				{monthlyCounts.map((count, monthIndex) => (
					<article key={MONTH_LABELS[monthIndex]} className="r-chart-row">
						<div className="r-chart-head">
							<span className="r-month-label">{MONTH_LABELS[monthIndex]}</span>
							<span className="r-month-value">{count}</span>
						</div>
						<div className="r-bar-track">
							<div
								className={`r-bar-fill ${reportCopy.accentClass}`}
								style={{ width: `${(count / maxCount) * 100}%` }}
							/>
						</div>
					</article>
				))}
			</section>
		</section>
	)
}