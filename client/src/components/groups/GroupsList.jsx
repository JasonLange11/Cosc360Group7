import { useEffect, useState } from 'react';
import CardDisplay from '../ui/CardDisplay';
import { getGroups, searchGroups } from '../../lib/groupsApi';
import './css/GroupsList.css';

function GroupsList({ searchTerm, onOpenGroup }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadGroups = async () => {
      try {
        setLoading(true);

        const term = searchTerm.trim();
        const data = term ? await searchGroups(term) : await getGroups();

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
  }, [searchTerm]);

  if (loading) {
    return <div className="groups-list-container">Loading groups...</div>;
  }

  if (error) {
    return <div className="groups-list-container error">Error: {error}</div>;
  }

  if (groups.length === 0) {
    return <div className="groups-list-container">No results found</div>;
  }

  return (
    <div className="groups-list-container">
      <div className="groups-grid">
        {groups.map((group) => (
          <CardDisplay
            key={group._id}
            groupId={group._id}
            onOpenGroup={onOpenGroup}
            img={{
              src: group.bannerImage,
              alt: group.name,
            }}
            heading={group.name}
            details={[
              ['fa-location-dot', group.location]
            ]}
            description={group.description}
          />
        ))}
      </div>
    </div>
  );
}

export default GroupsList;
