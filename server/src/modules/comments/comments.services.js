import {
  createComment as createCommentRecord,
  getCommentById,
  getCommentsByParent,
  getCommentsCountByParent,
  getCommentsByUserId,
  deleteCommentById,
} from "./comments.repository.js";

function toPlainComment(comment) {
  return typeof comment.toObject === "function" ? comment.toObject() : comment;
}

export async function fetchComments({ parentType, parentId, page = 1, limit = 5 }) {
  if (!parentType || !parentId) {
    throw new Error("Parent type and parent id are required");
  }

  const pageNumber = Number.parseInt(page, 10) || 1;
  const limitNumber = Number.parseInt(limit, 10) || 5;
  const skip = (pageNumber - 1) * limitNumber;

  const items = await getCommentsByParent(parentType, parentId, skip, limitNumber);
  const total = await getCommentsCountByParent(parentType, parentId);

  return { items, total, page: pageNumber, limit: limitNumber };
}

export async function fetchCommentById(commentId) {
  const comment = await getCommentById(commentId);

  if (!comment) {
    throw new Error("Comment not found");
  }

  return toPlainComment(comment);
}

export async function createComment(requestUser, commentData) {
  const parentType = commentData?.parentType;
  const parentId = commentData?.parentId;
  const content = commentData?.content?.trim();

  if (!parentType || !parentId) {
    throw new Error("Parent type and parent id are required");
  }

  if (!content) {
    throw new Error("Content is required");
  }

  const payload = {
    parentType,
    parentId,
    username: requestUser?.name || "Anonymous",
    content,
  };

  if (requestUser?.id) {
    payload.userId = requestUser.id;
  }

  return createCommentRecord(payload);
}

export async function removeComment(requestUser, targetCommentId) {
  if (!requestUser) {
    throw new Error("Authentication required");
  }

  const comment = await getCommentById(targetCommentId);

  if (!comment) {
    throw new Error("Comment not found");
  }

  const isOwnComment = requestUser.id?.toString() === comment.userId?.toString();

  if (isOwnComment) {
    await deleteCommentById(targetCommentId);
    return;
  }

  if (!requestUser.isAdmin) {
    throw new Error("Forbidden");
  }

  await deleteCommentById(targetCommentId);
}

export async function fetchUserComments(user) {
  if (!user) {
    throw new Error("Authentication required");
  }

  const comments = await getCommentsByUserId(user.id);
  return comments.map(toPlainComment);
}