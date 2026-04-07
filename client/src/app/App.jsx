import './App.css'
import HomePage from '../components/homepage/Homepage.jsx'
import { Navigate, Routes, Route } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import AdminPage from '../components/admin/AdminPage.jsx'
import SettingsPage from '../components/settings/SettingsPage.jsx'
import EditProfilePage from '../components/settings/EditProfilePage.jsx'
import GroupCreate from '../components/groups/GroupCreate.jsx'

import GroupsPage from '../components/groups/GroupsPage.jsx'

export default function App(){
  const { authReady, currentUser } = useAuth()

  if (!authReady) {
    return null
  }


  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={currentUser ? <Navigate to="/" replace /> : <HomePage authModal="login" />} />
      <Route path="/signup" element={currentUser ? <Navigate to="/" replace /> : <HomePage authModal="signup" />} />
      <Route path="/admin" element={currentUser && currentUser.isAdmin ? <AdminPage /> : <Navigate to="/" replace />} />
      <Route path="/settings" element={currentUser ? <SettingsPage /> : <Navigate to="/" replace />} />
      <Route path="/settings/edit" element={currentUser ? <EditProfilePage /> : <Navigate to="/" replace />} />
      <Route path="/groups" element={<GroupsPage />} />
      <Route path="/groups/new" element={currentUser ? <GroupCreate /> : <HomePage authModal="login" />} />
    </Routes>
  )
}
