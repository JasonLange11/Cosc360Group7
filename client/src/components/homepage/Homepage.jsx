import { useState } from 'react'
import Header from '../ui/Header'
import SearchBar from '../search/SearchBar'
import Footer from '../ui/Footer'
import Sidebar from '../ui/Sidebar'
import EventsList from '../events/EventsList'
import EventDetails from '../events/EventDetails'

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeEventId, setActiveEventId] = useState(null)

  const handleSearch = (term) => {
    setSearchTerm(term)
  }

  const handleOpenEvent = (eventId) => {
    setActiveEventId(eventId)
  }

  const handleCloseEvent = () => {
    setActiveEventId(null)
  }

  return (
    <>
      <div className={activeEventId ? 'page-content page-content-blurred' : 'page-content'}>
        <Header />
        <SearchBar onSearch={handleSearch} />
        <Sidebar />
        <EventsList searchTerm={searchTerm} onOpenEvent={handleOpenEvent} />
        <Footer />
      </div>

      {activeEventId ? <EventDetails eventId={activeEventId} onClose={handleCloseEvent} /> : null}
    </>
  )
}