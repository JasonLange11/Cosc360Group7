import { useState } from 'react'
import './css/SearchBar.css'

function SearchBar({
    onSearch,
    title = 'Your link to all events nearby',
    placeholder = 'search',
    buttonLabel = 'Search',
    variant = 'default',
    clearOnSearch = true,
    initialValue = '',
    className = '',
    inputAriaLabel = 'Search input',
}) {
    const [searchTerm, setSearchTerm] = useState(initialValue)

    const handleSubmit = (event) => {
        event.preventDefault()
        if (onSearch) {
            onSearch(searchTerm)
        }

        if (clearOnSearch) {
            setSearchTerm('')
        }
    }

    const sectionClasses = [
        'searchSection',
        variant === 'compact' ? 'searchSection--compact' : '',
        className,
    ].filter(Boolean).join(' ')

    return (
        <section className={sectionClasses}>
            {title ? <h2>{title}</h2> : null}

            <form className="searchForm" onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder={placeholder}
                    aria-label={inputAriaLabel}
                />
                <button type="submit">{buttonLabel}</button>
            </form>
        </section>
    )
}

export default SearchBar