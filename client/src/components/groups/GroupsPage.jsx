import { useState } from 'react'
import Header from '../ui/Header'
import SearchBar from '../search/SearchBar'
import Footer from '../ui/Footer'
import Sidebar from '../ui/Sidebar'
import GroupDetails from '../groups/GroupDetails'
import './css/GroupsPage.css'

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeEventId, setActiveEventId] = useState(null)
  const [activeGroupId, setActiveGroupId] = useState(null)

  const handleSearch = (term) => {
    setSearchTerm(term)
  }

  const handleOpenGroup = (groupId) => {
    setActiveGroupId(groupId)
  }

  const handleCloseGroup = () => {
    setActiveGroupId(null)
  }

  return (
    <>
      <div className={activeEventId || activeGroupId ? 'page-content page-content-blurred' : 'page-content'}>
        <Header />

        <div className="home-layout">
          <aside className="home-sidebar">
            <Sidebar onOpenGroup={handleOpenGroup} />
          </aside>

          <main className="home-main">
            <SearchBar onSearch={handleSearch} />
          </main>
        </div>
        
        <Footer />
      </div>

      {activeGroupId ? <GroupDetails groupId={activeGroupId} onClose={handleCloseGroup} /> : null}
    </>
  )
}