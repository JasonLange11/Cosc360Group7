// eslint-disable-next-line no-unused-vars
import './App.css'
import Header from '../components/Header'
import SearchBar from '../components/SearchBar'
import Footer from '../components/Footer'
import Sidebar from '../components/Sidebar'
import CardDisplay from '../components/CardDisplay'
import {Routes, Route} from 'react-router-dom'
import Login from '../features/auth/Login'
import Signup from '../features/auth/Registration'

const card1Image = {src:"/src/assets/bookclub.jpg", alt:"A stack of books with the words 'Book Club'"};

function HomePage() {

  return (
    <>
      <Header />
      <SearchBar />
      <Sidebar />
      <CardDisplay 
      img={card1Image} 
      heading="Book Club Meeting" 
      details={[
        ["/src/assets/calendar.svg", "August 19"], 
        ["/src/assets/clock.svg", "5:00pm PST"], 
        ["/src/assets/location.svg", "Okanagan Regional Library"]]
      } 
        description="Weekly Kelowna Book Club meet-up"/>
      <Footer />
    </>
  )
}

export default function App(){
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  )
}
