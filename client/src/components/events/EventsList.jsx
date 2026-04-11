import { useEffect, useState } from 'react';
import CardDisplay from '../ui/CardDisplay';
import { getEvents, searchEvents } from '../../lib/eventsApi';
import './css/EventsList.css';

function EventsList({ searchTerm, onOpenEvent, selectedTags = [] }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const filteredEvents = selectedTags.length === 0
    ? events
    : events.filter((event) => {
      const eventTags = Array.isArray(event.tags) ? event.tags : [];
      return selectedTags.every((tag) => eventTags.includes(tag));
    });

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

  if (filteredEvents.length === 0) {
    return <div className="events-list-container">No results found</div>;
  }

  return (
    <div className="events-list-container">
      <div className="events-grid">
        {filteredEvents.map((event) => (
          <CardDisplay
            key={event._id}
            eventId={event._id}
            onOpenEvent={onOpenEvent}
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
