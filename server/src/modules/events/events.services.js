import { createEvent, deleteEventById, getAllEvents, getEventById, getEventsByUserId, updateEventById, } from "./events.repository.js";

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

export async function createUserEvent(user, eventData) {
  if (!user) {
    throw new Error("Authentication required");
  }

  /*
   Might change this so admins can, but just want to 
   keep accounts seperate for now. Admins can edit 
   events still if they need to edit someones event.
  */
  if(user.isAdmin){
    throw new Error("Admins can not create events");
  }

  const event = await createEvent({
    ...eventData,
    userId: user.id,
  });

  return toPlainEvent(event);
}

export async function fetchEvents() {
  return getAllEvents();
}

export async function filterEvents(searchTerm) {
  const events = await fetchEvents();
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

  return toPlainEvent(event);
}

export async function fetchMyEvents(user) {
  if (!user) {
    throw new Error("Authentication required");
  }

  return getEventsByUserId(user.id);
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