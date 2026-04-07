import bcrypt from "bcrypt";
import { createComment, getAllComments, getCommentById, getCommentsByGroup, getCommentsByUserId, updateCommentById, deleteCommentById } from "./comments.respository";

const SALT_ROUNDS = 10;

function toPlainComment(comment) {
  return typeof comment.toObject === "function" ? comment.toObject() : comment;
}

export async function fetchComments(groupId) {
  return getCommentsByGroup(groupId);
}

export async function createComment(commentData) {
  return createComment(commentData);
}

export async function removeComment(requestUser, targetCommentId) {
  if (!requestUser) {
    throw new Error("Authentication required");
  }

  const comment = await getCommentById(targetCommentId);

  if (!comment) {
    throw new Error("User not found");
  }

  const isOwnComment = requestUser.id?.toString() === comment.userId

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

  return await toPlainComment(getCommentsByUserId(user.id));
}