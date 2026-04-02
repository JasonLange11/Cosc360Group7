import './css/Sidebar.css'

function Sidebar() {
    return (
        <div className='sidebar'>
            <section className='sidebar-panel'>
                <h2>Groups:</h2>
                <ul className='side list'>
                    <li><a href='#'>Group 1</a></li>
                    <li><a href='#'>Group 2</a></li>
                    <li><a href='#'>Group 3</a></li>
                </ul>
            </section>
        </div>
    ) //Need to modify this to dynamically update the displayed groups at some point
}

export default Sidebar