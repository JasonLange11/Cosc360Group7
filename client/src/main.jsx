import { createRoot } from 'react-dom/client'
import {BrowserRouter} from 'react-router-dom'
import App from './app/App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { PopupProvider } from './components/ui/PopupProvider'

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <BrowserRouter>
      <PopupProvider>
        <App />
      </PopupProvider>
    </BrowserRouter>
  </AuthProvider>,
)