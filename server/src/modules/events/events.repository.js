import { Event } from "./events.model.js";

export async function createEvent(eventData) {
  return Event.create(eventData);
}

export async function getAllEvents() {
  return Event.find().sort({ createdAt: -1 }).lean();
}

export async function getEventById(eventId) {
  return Event.findById(eventId);
}

export async function getEventsByUserId(userId) {
  return Event.find({ userId }).sort({ createdAt: -1 }).lean();
}

export async function updateEventById(eventId, updateData) {
  return Event.findByIdAndUpdate(eventId, updateData, {new: true, runValidators: true, });
}

export async function deleteEventById(eventId) {
  return Event.findByIdAndDelete(eventId);
}

export async function addTagToEvent(eventId, tag) {
  return Event.findByIdAndUpdate(
    eventId,
    { $addToSet: { tags: tag } },
    { new: true }
  );
}

export async function removeTagFromEvent(eventId, tag) {
  return Event.findByIdAndUpdate(
    eventId,
    { $pull: { tags: tag } },
    { new: true }
  );
}