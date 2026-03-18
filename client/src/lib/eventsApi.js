import { apiRequest } from './apiClient';


// Fetch all events
export async function getEvents() {
  return apiRequest('/api/events');
}


// Fetch a specific event by ID
export async function getEventById(eventId) {
  return apiRequest(`/api/events/${eventId}`);
}


// Fetch current user's events (requires authentication)
export async function getMyEvents() {
  const token = localStorage.getItem('token');
  return apiRequest('/api/events/mine', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
}


// Create a new event (requires authentication)
export async function createEvent(eventData) {
  const token = localStorage.getItem('token');
  return apiRequest('/api/events', {
    method: 'POST',
    body: JSON.stringify(eventData),
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
}


// Update an event (requires authentication)
export async function updateEvent(eventId, eventData) {
  const token = localStorage.getItem('token');
  return apiRequest(`/api/events/${eventId}`, {
    method: 'PUT',
    body: JSON.stringify(eventData),
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
}


// Delete an event (requires authentication)
export async function deleteEvent(eventId) {
  const token = localStorage.getItem('token');
  return apiRequest(`/api/events/${eventId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
}
