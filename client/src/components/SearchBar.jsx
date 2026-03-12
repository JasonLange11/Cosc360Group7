import './SearchBar.css'

function SearchBar() {
    return (
        <section className="searchSection">
            <h2>Your link to all events nearby</h2>

            <form className="searchForm" onSubmit={(event) => event.preventDefault()}>
                <input
                    type="text"
                    placeholder="search"
                />
                <button type="submit">Search</button>
            </form>
        </section>
    )
}

export default SearchBar