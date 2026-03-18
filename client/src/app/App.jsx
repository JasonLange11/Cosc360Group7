
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

  return (
    <>
      <Header />
      <SearchBar />
      <Sidebar />
      <EventsList />
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
