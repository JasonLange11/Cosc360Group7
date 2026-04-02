import {
  createEvent,
  deleteEventById,
  getAllEvents,
  getEventById,
  getEventsByAttendeeId,
  getEventsByUserId,
  updateEventById,
  addTagToEvent,
  removeTagFromEvent,
} from "./events.repository.js";
import { findUserById } from "../users/users.repository.js";

function cleanTag(tag) {
  if (tag === null || tag === undefined) {
    throw new Error("Tag is required");
  }

  const value = String(tag).trim().toLowerCase();
  if (value.length === 0) {
    throw new Error("Tag cannot be empty");
  }

  return value;
}

function normalizeEventStatus(status) {
  const normalizedStatus = String(status || "upcoming").trim().toLowerCase();

  if (["upcoming", "expired", "all"].includes(normalizedStatus)) {
    return normalizedStatus;
  }

  throw new Error("Invalid event status");
}

function getEventsDateFilter(status) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (status === "expired") {
    return { eventDate: { $lt: today } };
  }

  if (status === "upcoming") {
    return { eventDate: { $gte: today } };
  }

  return {};
}

function validateEventStatusAccess(status, user) {
  if ((status === "expired" || status === "all") && !user?.isAdmin) {
    throw new Error("Admin access required");
  }
}

function isEventExpired(eventDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const eventDay = new Date(eventDate);
  eventDay.setHours(0, 0, 0, 0);

  return eventDay < today;
}

function toPlainEvent(event) {
  return typeof event.toObject === "function" ? event.toObject() : event;
}

function canModifyEvent(user, event) {
  if (!user || !event) {
    return false;
  }

  if (user.isAdmin) {
    return true;
  }

  return event.userId.toString() === user.id.toString();
}

async function attachOrganizerName(event) {
  const plainEvent = toPlainEvent(event);

  if (!plainEvent?.userId) {
    return plainEvent;
  }

  const owner = await findUserById(plainEvent.userId);

  return {
    ...plainEvent,
    organizerName: owner?.name || "Unknown Organizer",
    attendees: plainEvent.attendees || [],
  };
}

export async function createUserEvent(user, eventData) {
  if (!user) {
    throw new Error("Authentication required");
  }

  if(user.isAdmin){
    throw new Error("Admins can not create events");
  }

  const event = await createEvent({
    ...eventData,
    userId: user.id,
  });

  return toPlainEvent(event);
}

export async function fetchEvents(options = {}) {
  const status = normalizeEventStatus(options.status);
  validateEventStatusAccess(status, options.user);

  const events = await getAllEvents(getEventsDateFilter(status));
  return Promise.all(events.map((event) => attachOrganizerName(event)));
}

export async function filterEvents(searchTerm, options = {}) {
  const events = await fetchEvents(options);
  const term = searchTerm.trim().toLowerCase();

  if (!term) {
    return events;
  }

  return events.filter((event) => {
    const title = event.title.toLowerCase();
    const location = event.location.toLowerCase();
    const description = event.description.toLowerCase();

    return (
      title.includes(term)
      || location.includes(term)
      || description.includes(term)
    );
  });
}

export async function fetchEventById(eventId) {
  const event = await getEventById(eventId);

  if (!event) {
    throw new Error("Event not found");
  }

  return attachOrganizerName(event);
}

export async function fetchMyEvents(user) {
  if (!user) {
    throw new Error("Authentication required");
  }

  const events = await getEventsByUserId(user.id);
  return Promise.all(events.map((event) => attachOrganizerName(event)));
}

export async function fetchAttendingEvents(user) {
  if (!user) {
    throw new Error("Authentication required");
  }

  const events = await getEventsByAttendeeId(user.id);
  return Promise.all(events.map((event) => attachOrganizerName(event)));
}

export async function attendEvent(user, eventId) {
  if (!user) {
    throw new Error("Authentication required");
  }

  const event = await getEventById(eventId);

  if (!event) {
    throw new Error("Event not found");
  }

  if (isEventExpired(event.eventDate)) {
    throw new Error("Cannot register for an expired event");
  }

  const isAlreadyAttending = event.attendees.some((attendeeId) => attendeeId.toString() === user.id.toString());

  if (!isAlreadyAttending) {
    event.attendees.push(user.id);
    await event.save();
  }

  return attachOrganizerName(event);
}

export async function unattendEvent(user, eventId) {
  if (!user) {
    throw new Error("Authentication required");
  }

  const event = await getEventById(eventId);

  if (!event) {
    throw new Error("Event not found");
  }

  event.attendees = event.attendees.filter((attendeeId) => attendeeId.toString() !== user.id.toString());
  await event.save();

  return attachOrganizerName(event);
}

export async function editEvent(user, eventId, updateData) {
  const existingEvent = await getEventById(eventId);

  if (!existingEvent) {
    throw new Error("Event not found");
  }

  if (!canModifyEvent(user, existingEvent)) {
    throw new Error("Forbidden");
  }

  const updatedEvent = await updateEventById(eventId, updateData);
  return toPlainEvent(updatedEvent);
}

export async function removeEvent(user, eventId) {
  const existingEvent = await getEventById(eventId);

  if (!existingEvent) {
    throw new Error("Event not found");
  }

  if (!canModifyEvent(user, existingEvent)) {
    throw new Error("Forbidden");
  }

  await deleteEventById(eventId);
}

export async function addEventTag(user, eventId, tag) {
  const existingEvent = await getEventById(eventId);

  if (!existingEvent) {
    throw new Error("Event not found");
  }

  if (!canModifyEvent(user, existingEvent)) {
    throw new Error("Forbidden");
  }

  const cleanedTag = cleanTag(tag);
  const updatedEvent = await addTagToEvent(eventId, cleanedTag);
  return attachOrganizerName(updatedEvent);
}

export async function removeEventTag(user, eventId, tag) {
  const existingEvent = await getEventById(eventId);

  if (!existingEvent) {
    throw new Error("Event not found");
  }

  if (!canModifyEvent(user, existingEvent)) {
    throw new Error("Forbidden");
  }

  const cleanedTag = cleanTag(tag);
  const updatedEvent = await removeTagFromEvent(eventId, cleanedTag);
  return attachOrganizerName(updatedEvent);
}
