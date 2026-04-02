import {
  createComment,
  deleteCommentById,
  getCommentById,
  getCommentsByEventId,
  getCommentsByUserId,
  updateCommentById,
} from "./comments.repository.js";
import { getEventById } from "../events/events.repository.js";

function toPlainComment(comment) {
  return typeof comment?.toObject === "function" ? comment.toObject() : comment;
}

function canManageComment(user, comment) {
  if (!user || !comment) {
    return false;
  }

  if (user.isAdmin) {
    return true;
  }

  return comment.userId.toString() === user.id.toString();
}

export async function createEventComment(user, eventId, commentData) {
  if (!user) {
    throw new Error("Authentication required");
  }

  if (!commentData?.content?.trim()) {
    throw new Error("Comment content is required");
  }

  const event = await getEventById(eventId);

  if (!event) {
    throw new Error("Event not found");
  }

  const comment = await createComment({
    eventId,
    userId: user.id,
    content: commentData.content,
  });

  return toPlainComment(comment);
}

export async function fetchEventComments(eventId) {
  const event = await getEventById(eventId);

  if (!event) {
    throw new Error("Event not found");
  }

  return getCommentsByEventId(eventId);
}

export async function fetchMyComments(user) {
  if (!user) {
    throw new Error("Authentication required");
  }

  return getCommentsByUserId(user.id);
}

export async function editComment(user, commentId, updateData) {
  const existingComment = await getCommentById(commentId);

  if (!existingComment) {
    throw new Error("Comment not found");
  }

  if (!canManageComment(user, existingComment)) {
    throw new Error("Forbidden");
  }

  if (!updateData?.content?.trim()) {
    throw new Error("Comment content is required");
  }

  return updateCommentById(commentId, { content: updateData.content });
}

export async function removeComment(user, commentId) {
  const existingComment = await getCommentById(commentId);

  if (!existingComment) {
    throw new Error("Comment not found");
  }

  if (!canManageComment(user, existingComment)) {
    throw new Error("Forbidden");
  }

  await deleteCommentById(commentId);
}
