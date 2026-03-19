import { useState } from 'react'
import './SearchBar.css'

function SearchBar({ onSearch }) {
    const [searchTerm, setSearchTerm] = useState('')

    const handleSubmit = (event) => {
        event.preventDefault()
        onSearch(searchTerm)
        setSearchTerm('')
    }

    return (
        <section className="searchSection">
            <h2>Your link to all events nearby</h2>

            <form className="searchForm" onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="search"
                />
                <button type="submit">Search</button>
            </form>
        </section>
    )
}

export default SearchBar