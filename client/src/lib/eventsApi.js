import { apiRequest } from './apiClient';
import { getAuthHeader } from './auth';

function buildEventsRequestOptions(options = {}) {
  return {
    headers: options.includeAuth ? getAuthHeader() : undefined,
  };
}

function buildEventsQuery(options = {}) {
  const params = new URLSearchParams();

  if (options.status) {
    params.set('status', options.status);
  }

  const query = params.toString();
  return query ? `?${query}` : '';
}

// Fetch all events
export async function getEvents(options = {}) {
  return apiRequest(`/api/events${buildEventsQuery(options)}`, buildEventsRequestOptions(options));
}

// Search events by term
export async function searchEvents(searchTerm, options = {}) {
  return apiRequest('/api/events/search', {
    method: 'POST',
    body: JSON.stringify({ searchTerm, status: options.status }),
    ...buildEventsRequestOptions(options),
  });
}

// Fetch a specific event by ID
export async function getEventById(eventId) {
  return apiRequest(`/api/events/${eventId}`);
}

// Fetch current user's events (requires authentication)
export async function getMyEvents() {
  return apiRequest('/api/events/mine', {
    headers: getAuthHeader(),
  });
}

export async function getAttendingEvents() {
  return apiRequest('/api/events/attending', {
    headers: getAuthHeader(),
  });
}

export async function attendEvent(eventId) {
  return apiRequest(`/api/events/${eventId}/attend`, {
    method: 'POST',
    headers: getAuthHeader(),
  });
}

export async function unattendEvent(eventId) {
  return apiRequest(`/api/events/${eventId}/attend`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
}

// Create a new event (requires authentication)
export async function createEvent(eventData) {
  return apiRequest('/api/events', {
    method: 'POST',
    body: JSON.stringify(eventData),
    headers: getAuthHeader(),
  });
}

// Update an event (requires authentication)
export async function updateEvent(eventId, eventData) {
  return apiRequest(`/api/events/${eventId}`, {
    method: 'PUT',
    body: JSON.stringify(eventData),
    headers: getAuthHeader(),
  });
}

// Delete an event (requires authentication)
export async function deleteEvent(eventId) {
  return apiRequest(`/api/events/${eventId}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
}

// Add a tag to an event (requires authentication)
export async function addTagToEvent(eventId, tag) {
  return apiRequest('/api/events/' + eventId + '/tags', {
    method: 'PATCH',
    body: JSON.stringify({ tag }),
    headers: getAuthHeader(),
  });
}

// Remove a tag from an event (requires authentication)
export async function removeTagFromEvent(eventId, tag) {
  return apiRequest('/api/events/' + eventId + '/tags', {
    method: 'DELETE',
    body: JSON.stringify({ tag }),
    headers: getAuthHeader(),
  });
}
