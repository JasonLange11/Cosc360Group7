import { useEffect, useState } from 'react'
import { getGroups } from '../../lib/groupsApi'
import { TAG_OPTIONS } from '../../lib/tagOptions.js'
import './css/Sidebar.css'

function Sidebar({
  onOpenGroup,
  availableTags = TAG_OPTIONS,
  selectedTags = [],
  onSelectedTagsChange,
}) {
    const [groups, setGroups] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    
    useEffect(() => {
        const loadGroups = async () => {
          try {
            setLoading(true)

            const data = await getGroups()
    
            setGroups(data.slice(0, 5))
            setError(null)
          } catch (err) {
            setError(err.message || 'Failed to load groups')
            setGroups([])
          } finally {
            setLoading(false)
          }
        }

        loadGroups()
      }, []
    )
    
    if (loading) {
    return <div className="events-list-container">Loading events...</div>
  }

  if (error) {
    return <div className="events-list-container error">Error: {error}</div>
  }

  if (groups.length === 0) {
    return <div className="events-list-container">No results found</div>
  }

    const handleItemClick = (groupId) => {
        if (groupId) {
            onOpenGroup(groupId)
        }
    }

    const handleTagToggle = (tag) => {
      if (selectedTags.includes(tag)) {
        onSelectedTagsChange(selectedTags.filter((value) => value !== tag))
        return
      }

      onSelectedTagsChange([...selectedTags, tag])
    }

    const handleResetTags = () => {
      onSelectedTagsChange([])
    }

    return (
        <div className='sidebar'>
        <section className='sidebar-panel'>
          <h2>Tags:</h2>
          <details className="sidebar-tag-dropdown">
            <summary>
              Select tags {selectedTags.length > 0 ? `(${selectedTags.length})` : ''}
            </summary>

            <div className="sidebar-tag-options">
              {availableTags.map((tag) => (
                <label key={tag} className="sidebar-tag-option">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag)}
                    onChange={() => handleTagToggle(tag)}
                  />
                  <span>{tag}</span>
                </label>
              ))}
            </div>
          </details>

          <button type="button" className="sidebar-tag-reset" onClick={handleResetTags}>
            Reset Tags
          </button>
        </section>

            <section className='sidebar-panel'>
                <h2>Groups:</h2>
                <ul className='side list'>
                    {
                        groups.map((group) => (
                      <li key={group._id}><button onClick={() => handleItemClick(group._id)}>{group.name}</button></li>
                        ))
                    }
                </ul>
            </section>
        </div>
          )
}

export default Sidebar