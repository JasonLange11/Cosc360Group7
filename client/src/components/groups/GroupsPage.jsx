import { useState } from 'react'
import Header from '../ui/Header'
import SearchBar from '../search/SearchBar'
import Footer from '../ui/Footer'
import Sidebar from '../ui/Sidebar'
import EventsList from '../events/EventsList'
import GroupDetails from '../groups/GroupDetails'
import './css/GroupsPage.css'
import GroupsList from './GroupsList'

export default function GroupsPage() {
  const [searchTerm, setSearchTerm] = useState('')
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
      <div className={activeGroupId ? 'page-content page-content-blurred' : 'page-content'}>
        <Header />

        <div className="groups-layout">

          <main className="groups-main">
            <SearchBar onSearch={handleSearch} />
            <GroupsList searchTerm={searchTerm} onOpenGroup={handleOpenGroup} />
          </main>
        </div>
        
        <Footer />
      </div>

      {activeGroupId ? <GroupDetails groupId={activeGroupId} onClose={handleCloseGroup} /> : null}
    </>
  )
}