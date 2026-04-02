
import './App.css'
import HomePage from '../components/homepage/Homepage.jsx'
import { Navigate, Routes, Route } from 'react-router-dom'
import Login from '../components/auth/Login'
import Signup from '../components/auth/Registration'
import { useAuth } from '../context/AuthContext.jsx'
import AdminPage from '../components/admin/AdminPage.jsx'
import GroupsPage from '../components/groups/GroupsPage.jsx'


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
      <Route path="/groups" element={currentUser ? <GroupsPage /> : <Navigate to="/" replace />}/>
    </Routes>
  )
}
