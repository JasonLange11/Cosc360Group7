import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../ui/Header'
import SearchBar from '../search/SearchBar'
import Footer from '../ui/Footer'
import Sidebar from '../ui/Sidebar'
import EventsList from '../events/EventsList'
import EventDetails from '../events/EventDetails'
import GroupDetails from '../groups/GroupDetails'
import Login from '../auth/Login'
import Signup from '../auth/Registration'
import './css/Homepage.css'

export default function HomePage({ authModal = null }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [availableTags, setAvailableTags] = useState([])
  const [activeEventId, setActiveEventId] = useState(null)
  const [activeGroupId, setActiveGroupId] = useState(null)
  const navigate = useNavigate()

  const handleSearch = (term) => {
    setSearchTerm(term)
  }

  const handleTagsChange = (tags) => {
    setSelectedTags(tags)
  }

  const handleOpenEvent = (eventId) => {
    setActiveEventId(eventId)
  }

  const handleOpenGroup = (groupId) => {
    setActiveGroupId(groupId)
  }

  const handleCloseEvent = () => {
    setActiveEventId(null)
  }

  const handleCloseGroup = () => {
    setActiveGroupId(null)
  }

  const handleCloseAuth = () => {
    navigate('/', { replace: true })
  }

  const isOverlayOpen = Boolean(activeEventId || activeGroupId || authModal)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow

    if (isOverlayOpen) {
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOverlayOpen])

  return (
    <>
      <div className={isOverlayOpen ? 'page-content page-content-blurred' : 'page-content'}>
        <Header />

        <div className="home-layout">
          <aside className="home-sidebar">
            <Sidebar
              onOpenGroup={handleOpenGroup}
              availableTags={availableTags}
              selectedTags={selectedTags}
              onSelectedTagsChange={handleTagsChange}
            />
          </aside>

          <main className="home-main">
            <SearchBar onSearch={handleSearch} />
            <EventsList
              searchTerm={searchTerm}
              onOpenEvent={handleOpenEvent}
              onTagsLoaded={setAvailableTags}
              selectedTags={selectedTags}
            />
          </main>
        </div>
        
        <Footer />
      </div>

      {activeEventId ? <EventDetails eventId={activeEventId} onClose={handleCloseEvent} /> : null}
      {activeGroupId ? <GroupDetails groupId={activeGroupId} onClose={handleCloseGroup} /> : null}
      {authModal === 'login' ? <Login modal onClose={handleCloseAuth} /> : null}
      {authModal === 'signup' ? <Signup modal onClose={handleCloseAuth} /> : null}
    </>
  )
}