
/*
    Navbar will change depending who is currently logged in
    For example: if no one is logged in the only thing someone will see is the Login button
*/
import './Navbar.css'
import '@fortawesome/fontawesome-free/css/all.min.css';
import { NavLink} from 'react-router-dom'

function Navbar(){
    return(
        <nav className="headerNav">
            <ul>
                <li>
                    <i className="fa-solid fa-calendar-plus"></i>
                    Create
                </li>
                <li>
                    <i className="fa-solid fa-users"></i>
                    Group
                </li>
                <li>
                    <i className="fa-solid fa-crown"></i>
                    Admin Panel
                </li>
                <li>
                    <NavLink to='/login'>
                        <i className="fa-regular fa-circle-user"></i>
                        Login
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
}

export default Navbar;