import {
  attendEvent,
  createUserEvent,
  editEvent,
  fetchAttendingEvents,
  fetchEventById,
  fetchEvents,
  fetchMyEvents,
  filterEvents,
  removeEvent,
  unattendEvent,
} from "./events.services.js";

export async function getEvents(req, res, next) {
  try {
    const events = await fetchEvents();
    res.status(200).json(events);
  } catch (error) {
    next(error);
  }
}

export async function searchEvents(req, res, next) {
  try {
    const searchTerm = String(req.body.searchTerm || "");
    const events = await filterEvents(searchTerm);
    res.status(200).json(events);
  } catch (error) {
    next(error);
  }
}

export async function getMyEvents(req, res, next) {
  try {
    const events = await fetchMyEvents(req.user);
    res.status(200).json(events);
  } catch (error) {
    next(error);
  }
}

export async function getAttendingEvents(req, res, next) {
  try {
    const events = await fetchAttendingEvents(req.user);
    res.status(200).json(events);
  } catch (error) {
    next(error);
  }
}

export async function getEvent(req, res, next) {
  try {
    const event = await fetchEventById(req.params.eventId);
    res.status(200).json(event);
  } catch (error) {
    next(error);
  }
}

export async function createEvent(req, res, next) {
  try {
    const event = await createUserEvent(req.user, req.body);
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
}

export async function updateEvent(req, res, next) {
  try {
    const event = await editEvent(req.user, req.params.eventId, req.body);
    res.status(200).json(event);
  } catch (error) {
    next(error);
  }
}

export async function deleteEvent(req, res, next) {
  try {
    await removeEvent(req.user, req.params.eventId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function attendEventController(req, res, next) {
  try {
    const event = await attendEvent(req.user, req.params.eventId);
    res.status(200).json(event);
  } catch (error) {
    next(error);
  }
}

export async function unattendEventController(req, res, next) {
  try {
    const event = await unattendEvent(req.user, req.params.eventId);
    res.status(200).json(event);
  } catch (error) {
    next(error);
  }
}
