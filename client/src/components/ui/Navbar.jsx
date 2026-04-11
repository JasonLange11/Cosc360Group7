/*
    Navbar will change depending who is currently logged in
    For example: if no one is logged in the only thing someone will see is the Login button
*/
import './css/Navbar.css'
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useEffect, useRef, useState } from 'react'
import { NavLink} from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

function Navbar(){
    const { currentUser, logout } = useAuth()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const menuRef = useRef(null)

    useEffect(() => {
        function handleWindowClick(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false)
            }
        }

        function handleEscape(event) {
            if (event.key === 'Escape') {
                setIsMenuOpen(false)
            }
        }

        window.addEventListener('mousedown', handleWindowClick)
        window.addEventListener('keydown', handleEscape)

        return () => {
            window.removeEventListener('mousedown', handleWindowClick)
            window.removeEventListener('keydown', handleEscape)
        }
    }, [])

    function handleMenuToggle() {
        setIsMenuOpen((isOpen) => !isOpen)
    }

    function handleLogoutClick() {
        setIsMenuOpen(false)
        logout()
    }

    function handleSettingsClick() {
        setIsMenuOpen(false)
    }

    return(
        <nav className="headerNav">
            <ul>
                {currentUser ? (
                    <>  
                        {!currentUser.isAdmin ? (
                        <li>
                            <NavLink to="/events/new">
                                <i className="fa-solid fa-calendar-plus"></i>
                                Create Event
                            </NavLink>
                        </li>
                        ) : null}      
                        
                            <li>
                                <NavLink to="/groups">
                                    <i className="fa-solid fa-users"></i>
                                    Group
                                </NavLink>
                            </li>
                         
                        {!currentUser.isAdmin ? (
                            <li>
                                <NavLink to="/groups/new">
                                    <i className="fa-solid fa-users"></i>
                                    Create Group
                                </NavLink>
                            </li>
                        ) : null}   
                        {currentUser.isAdmin ? (
                            <li>
                                <NavLink to='/admin'>
                                    <i className="fa-solid fa-crown"></i>
                                    Admin Panel
                                </NavLink>
                            </li>
                        ) : null}
                        <li className="nav-account-menu" ref={menuRef}>
                            <button
                                type="button"
                                className="nav-button nav-account-button"
                                onClick={handleMenuToggle}
                                aria-expanded={isMenuOpen}
                                aria-haspopup="menu"
                            >
                                <span>
                                    <i className="fa-regular fa-circle-user"></i>
                                    {currentUser.name}
                                </span>
                                <i className={`fa-solid ${isMenuOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                            </button>

                            {isMenuOpen ? (
                                <div className="nav-dropdown" role="menu">
                                    <NavLink to="/settings" className="nav-dropdown-item" onClick={handleSettingsClick}>
                                        Settings
                                    </NavLink>
                                    <button type="button" className="nav-dropdown-item" onClick={handleLogoutClick}>
                                        Logout
                                    </button>
                                </div>
                            ) : null}
                        </li>
                    </>
                ) :
                 (
                <>
                    <li>
                        <NavLink to="/groups">
                            <i className="fa-solid fa-users"></i>
                             Group
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to='/login'>
                            <i className="fa-regular fa-circle-user"></i>
                            Login
                        </NavLink>
                    </li>
                </>
                )}
            </ul>
        </nav>
    );
}

export default Navbar;
