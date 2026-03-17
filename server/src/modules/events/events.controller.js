import {
  createUserEvent,
  editEvent,
  fetchEventById,
  fetchEvents,
  fetchMyEvents,
  removeEvent,
} from "./events.services.js";

function getErrorStatus(errorMessage) {
  if (errorMessage === "Authentication required") {
    return 401;
  }

  if (errorMessage === "Forbidden") {
    return 403;
  }

  if (errorMessage === "Event not found") {
    return 404;
  }

  return 500;
}

export async function getEvents(req, res) {
  try {
    const events = await fetchEvents();
    res.status(200).json(events);
  } catch (error) {
    const status = getErrorStatus(error.message);
    res.status(status).json({ message: error.message || "Failed to load events" });
  }
}

export async function getMyEvents(req, res) {
  try {
    const events = await fetchMyEvents(req.user);
    res.status(200).json(events);
  } catch (error) {
    const status = getErrorStatus(error.message);
    res.status(status).json({ message: error.message || "Failed to load user events" });
  }
}

export async function getEvent(req, res) {
  try {
    const event = await fetchEventById(req.params.eventId);
    res.status(200).json(event);
  } catch (error) {
    const status = getErrorStatus(error.message);
    res.status(status).json({ message: error.message || "Failed to load event" });
  }
}

export async function createEvent(req, res) {
  try {
    const event = await createUserEvent(req.user, req.body);
    res.status(201).json(event);
  } catch (error) {
    const status = getErrorStatus(error.message);
    res.status(status).json({ message: error.message || "Failed to create event" });
  }
}

export async function updateEvent(req, res) {
  try {
    const event = await editEvent(req.user, req.params.eventId, req.body);
    res.status(200).json(event);
  } catch (error) {
    const status = getErrorStatus(error.message);
    res.status(status).json({ message: error.message || "Failed to update event" });
  }
}

export async function deleteEvent(req, res) {
  try {
    await removeEvent(req.user, req.params.eventId);
    res.status(204).send();
  } catch (error) {
    const status = getErrorStatus(error.message);
    res.status(status).json({ message: error.message || "Failed to delete event" });
  }
}