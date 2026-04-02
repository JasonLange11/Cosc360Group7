import { EventComment } from "./comments.model.js";

export async function createComment(commentData) {
  return EventComment.create(commentData);
}

export async function getCommentsByEventId(eventId) {
  return EventComment.find({ eventId }).sort({ createdAt: -1 }).lean();
}

export async function getCommentsByUserId(userId) {
  return EventComment.find({ userId }).sort({ createdAt: -1 }).lean();
}

export async function getCommentById(commentId) {
  return EventComment.findById(commentId);
}

export async function updateCommentById(commentId, updateData) {
  return EventComment.findByIdAndUpdate(commentId, updateData, { new: true, runValidators: true }).lean();
}

export async function deleteCommentById(commentId) {
  return EventComment.findByIdAndDelete(commentId);
}
