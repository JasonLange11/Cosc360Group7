
/*
    Navbar will change depending who is currently logged in
    For example: if no one is logged in the only thing someone will see is the Login button

    TODO: add icons to the nav links
*/

function Navbar(){
    return(
        <nav>
            <ul>
                <li>
                    Create
                </li>
                <li>
                    Group
                </li>
                <li>
                    Admin Panel
                </li>
                <li>
                    Login
                </li>
            </ul>
        </nav>
    );
}

export default Navbar;