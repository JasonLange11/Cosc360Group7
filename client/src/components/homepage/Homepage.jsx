import { useState } from 'react'
import Header from '../ui/Header'
import SearchBar from '../search/SearchBar'
import Footer from '../ui/Footer'
import Sidebar from '../ui/Sidebar'
import EventsList from '../events/EventsList'
import EventDetails from '../events/EventDetails'
import './css/Homepage.css'

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

        <div className="home-layout">
          <aside className="home-sidebar">
            <Sidebar />
          </aside>

          <main className="home-main">
            <SearchBar onSearch={handleSearch} />
            <EventsList searchTerm={searchTerm} onOpenEvent={handleOpenEvent} />
          </main>
        </div>
        
        <Footer />
      </div>

      {activeEventId ? <EventDetails eventId={activeEventId} onClose={handleCloseEvent} /> : null}
    </>
  )
}