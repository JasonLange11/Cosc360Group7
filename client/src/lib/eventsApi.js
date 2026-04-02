import { apiRequest } from './apiClient';
import { getAuthHeader } from './auth';


// Fetch all events
export async function getEvents() {
  return apiRequest('/api/events');
}


// Search events by term
export async function searchEvents(searchTerm) {
  return apiRequest('/api/events/search', {
    method: 'POST',
    body: JSON.stringify({ searchTerm }),
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
  return apiRequest("/api/events/" + eventId + "/tags", {
    method: "PATCH",
    body: JSON.stringify({ tag }),
    headers: getAuthHeader(),
  });
}

// Remove a tag from an event (requires authentication)
export async function removeTagFromEvent(eventId, tag) {
  return apiRequest("/api/events/" + eventId + "/tags", {
    method: "DELETE",
    body: JSON.stringify({ tag }),
    headers: getAuthHeader(),
  });
}
