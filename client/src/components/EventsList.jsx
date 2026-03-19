import { useEffect, useState } from 'react';
import CardDisplay from './CardDisplay';
import { getEvents } from '../lib/eventsApi';
import './EventsList.css';

function EventsList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await getEvents();
        setEvents(data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load events');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return <div className="events-list-container">Loading events...</div>;
  }

  if (error) {
    return <div className="events-list-container error">Error: {error}</div>;
  }

  if (!events || events.length === 0) {
    return <div className="events-list-container">No events found</div>;
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
