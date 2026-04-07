import '@fortawesome/fontawesome-free/css/all.min.css'
import './css/AdminNavbar.css'

export default function AdminNavbar({ activeTab, onTabChange }){
    return(
        <nav className="a-nav" aria-label="Admin navigation">
            <section className="a-navbtn">
                <button
                    type="button"
                    className={activeTab === 'dashboard' ? 'is-active' : ''}
                    onClick={() => onTabChange('dashboard')}
                >
                    <i className="fa-solid fa-house"></i>
                    Dashboard
                </button>
            </section>

            <section className="a-navbtn">
                <button
                    type="button"
                    className={activeTab === 'users' ? 'is-active' : ''}
                    onClick={() => onTabChange('users')}
                >
                    <i className="fa-regular fa-user"></i>
                    Moderate Users
                </button>
            </section>

            <section className="a-navbtn">
                <button
                    type="button"
                    className={activeTab === 'events' ? 'is-active' : ''}
                    onClick={() => onTabChange('events')}
                >
                    <i className="fa-solid fa-calendar-days"></i>
                    Moderate Events
                </button>
            </section>

            <section className="a-navbtn">
                <button
                    type="button"
                    className={activeTab === 'groups' ? 'is-active' : ''}
                    onClick={() => onTabChange('groups')}
                >
                    <i className="fa-solid fa-users"></i>
                    Moderate Groups
                </button>
            </section>

            <section className="a-navbtn">
                <button
                    type="button"
                    className={activeTab === 'reviews' ? 'is-active' : ''}
                    onClick={() => onTabChange('reviews')}
                >
                    <i className="fa-regular fa-envelope"></i>
                    Pending Reviews
                </button>
            </section>
        </nav>
    )
}