
import Navbar from './Navbar.jsx'
import './Header.css'

export default function Header(){

    return (
        <header className="header">
            <h1>
                TouchGrassEvents
            </h1>
            <Navbar />
        </header>
    );
}

export function HeaderWithoutNav(){

    return (
        <header className="header">
            <h1>
                TouchGrassEvents
            </h1>
        </header>
    );
}
