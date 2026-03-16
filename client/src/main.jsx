import { createRoot } from 'react-dom/client'
import {BrowserRouter} from 'react-router-dom'
import './app/index.css'
import App from './app/App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AuthProvider>,
)