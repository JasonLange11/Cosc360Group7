
import { useState } from 'react'
import './App.css'
import Header from '../components/Header'
import SearchBar from '../components/SearchBar'
import Footer from '../components/Footer'
import Sidebar from '../components/Sidebar'
import EventsList from '../components/EventsList'
import { Navigate, Routes, Route } from 'react-router-dom'
import Login from '../features/auth/Login'
import Signup from '../features/auth/Registration'
import { useAuth } from '../context/AuthContext.jsx'

function HomePage() {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = (term) => {
    setSearchTerm(term)
  }

  return (
    <>
      <Header />
      <SearchBar onSearch={handleSearch} />
      <Sidebar />
      <EventsList searchTerm={searchTerm} />
      <Footer />
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
    </Routes>
  )
}
