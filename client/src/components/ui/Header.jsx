
import Navbar from './Navbar.jsx'
import './css/Header.css'

export default function Header(){

    return (
        <header className="header">
            <h1>
                <a href=''>TouchGrassEvents</a>
            </h1>
            <Navbar />
        </header>
    );
}

export function HeaderWithoutNav(){

    return (
        <header className="header">
            <h1>
                <a href=''>TouchGrassEvents</a>
            </h1>
        </header>
    );
}
