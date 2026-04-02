import { apiRequest } from './apiClient';
import { getAuthHeader } from './auth';

export async function getEvents() {
  return apiRequest('/api/events');
}

export async function searchEvents(searchTerm) {
  return apiRequest('/api/events/search', {
    method: 'POST',
    body: JSON.stringify({ searchTerm }),
  });
}

export async function getEventById(eventId) {
  return apiRequest(`/api/events/${eventId}`);
}

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

export async function getEventComments(eventId) {
  return apiRequest(`/api/events/${eventId}/comments`);
}

export async function createEventComment(eventId, content) {
  return apiRequest(`/api/events/${eventId}/comments`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify({ content }),
  });
}

export async function createEvent(eventData) {
  return apiRequest('/api/events', {
    method: 'POST',
    body: JSON.stringify(eventData),
    headers: getAuthHeader(),
  });
}

export async function updateEvent(eventId, eventData) {
  return apiRequest(`/api/events/${eventId}`, {
    method: 'PUT',
    body: JSON.stringify(eventData),
    headers: getAuthHeader(),
  });
}

export async function deleteEvent(eventId) {
  return apiRequest(`/api/events/${eventId}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
}
