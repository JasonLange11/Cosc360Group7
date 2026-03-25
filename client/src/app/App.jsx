
import { useState } from 'react'
import './App.css'
import Header from '../components/Header'
import SearchBar from '../components/SearchBar'
import Footer from '../components/Footer'
import Sidebar from '../components/Sidebar'
import EventsList from '../components/EventsList'
import EventDetails from '../components/EventDetails'
import { Navigate, Routes, Route } from 'react-router-dom'
import Login from '../features/auth/Login'
import Signup from '../features/auth/Registration'
import { useAuth } from '../context/AuthContext.jsx'
import AdminPage from '../components/admin/AdminPage.jsx'

function HomePage() {
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

export default function App(){
  const { authReady, currentUser } = useAuth()

  if (!authReady) {
    return null
  }


  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={currentUser ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/signup" element={currentUser ? <Navigate to="/" replace /> : <Signup />} />
      <Route path="/admin" element={currentUser && currentUser.isAdmin ? <AdminPage /> : <Navigate to="/" replace />} />
    </Routes>
  )
}
