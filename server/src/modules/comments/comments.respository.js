import { Comment } from "./comments.model";

export async function createComment(commentData) {
  return Comment.create(commentData);
}

export async function getAllComments() {
  return Comment.find().sort({ createdAt: -1 }).lean(); //NOTE: Why is lean used here but not elsewhere?
}

export async function getCommentsByGroup(groupId) {
  return Comment.find({ groupId }).sort({ createdAt: -1 }).lean();
}

export async function getCommentById(commentId) {
  return Comment.findById(commentId);
}

export async function updateCommentById(commentId, updateData) {
  return Comment.findByIdAndUpdate(commentId, updateData, {new: true, runValidators: true, });
}

export async function deleteCommentById(commentId) {
  return Comment.findByIdAndDelete(commentId);
}

export async function getCommentsByUserId(userId) {
  return Comment.find({ userId }).sort({ createdAt: -1 }).lean();
}