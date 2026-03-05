import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import SearchBar from './components/SearchBar'
import Footer from './components/Footer'
import Sidebar from './components/Sidebar'

function App() {

  return (
    <>
      <Header />
      <SearchBar />
      <Sidebar />
      <Footer />
    </>
  )
}

export default App
