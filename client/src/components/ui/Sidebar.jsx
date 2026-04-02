import { useEffect, useState } from 'react';
import { getGroups } from '../../lib/groupsApi';
import './css/Sidebar.css'

function Sidebar() {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const loadGroups = async () => {
          try {
            setLoading(true);

            const data = await getGroups();
    
            setGroups(data);
            setError(null);
          } catch (err) {
            setError(err.message || 'Failed to load groups');
            setGroups([]);
          } finally {
            setLoading(false);
          }
        };

        loadGroups();
      }, []
    );
    
    if (loading) {
    return <div className="events-list-container">Loading events...</div>;
  }

  if (error) {
    return <div className="events-list-container error">Error: {error}</div>;
  }

  if (groups.length === 0) {
    return <div className="events-list-container">No results found</div>;
  }

    return (
        <div className='sidebar'>
            <section className='sidebar-panel'>
                <h2>Groups:</h2>
                <h4><a href="/groups"></a></h4>
                <ul className='side list'>
                    {
                        groups.map((group) => (
                            <li><a href='#'>{group.name}</a></li>
                        ))
                    }
                </ul>
            </section>
        </div>
    ) //Need to modify this to dynamically update the displayed groups at some point
}

export default Sidebar