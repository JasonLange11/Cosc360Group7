import { useEffect, useState } from 'react';
import CardDisplay from './CardDisplay';
import { getEvents, searchEvents } from '../lib/eventsApi';
import './EventsList.css';

function EventsList({ searchTerm }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);

        const term = searchTerm.trim();
        const data = term ? await searchEvents(term) : await getEvents();

        setEvents(data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load events');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [searchTerm]);

  if (loading) {
    return <div className="events-list-container">Loading events...</div>;
  }

  if (error) {
    return <div className="events-list-container error">Error: {error}</div>;
  }

  if (events.length === 0) {
    return <div className="events-list-container">No results found</div>;
  }

  return (
    <div className="events-list-container">
      <div className="events-grid">
        {events.map((event) => (
          <CardDisplay
            key={event._id}
            img={{
              src: event.bannerImage,
              alt: event.title,
            }}
            heading={event.title}
            details={[
              ['fa-calendar', new Date(event.eventDate).toLocaleDateString()],
              ['fa-clock', event.eventTime],
              ['fa-location-dot', event.location],
            ]}
            description={event.description}
          />
        ))}
      </div>
    </div>
  );
}

export default EventsList;
