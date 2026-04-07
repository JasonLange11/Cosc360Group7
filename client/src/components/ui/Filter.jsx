
import '@fortawesome/fontawesome-free/css/all.min.css'
import './css/Filter.css'

export default function Filter({
    options = [],
    selectedValue,
    onChange,
    ariaLabel = 'Filters',
    className = '',
    fullWidth = false,
}) {
    return (
        <nav
            className={`filter-bar ${fullWidth ? 'filter-bar-full' : ''} ${className}`.trim()}
            aria-label={ariaLabel}
        >
            {options.map((option) => {
                const isActive = option.value === selectedValue

                return (
                    <button
                        key={option.value}
                        type="button"
                        className={isActive ? 'is-active' : ''}
                        onClick={() => onChange?.(option.value)}
                        disabled={option.disabled}
                        aria-pressed={isActive}
                    >
                        {option.icon ? <i className={option.icon} aria-hidden="true"></i> : null}
                        <span>{option.label}</span>
                    </button>
                )
            })}
        </nav>
    )
}