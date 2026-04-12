import { Comment } from "./comments.model.js";

export async function createComment(commentData) {
  return Comment.create(commentData);
}

export async function getCommentsByParent(parentType, parentId, skip = 0, limit = 5) {
  return Comment.find({ parentType, parentId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
}

export async function getCommentsCountByParent(parentType, parentId) {
  return Comment.countDocuments({ parentType, parentId });
}

export async function getCommentById(commentId) {
  return Comment.findById(commentId);
}

export async function deleteCommentById(commentId) {
  return Comment.findByIdAndDelete(commentId);
}

export async function updateCommentContentById(commentId, content) {
  return Comment.findByIdAndUpdate(
    commentId,
    { content },
    { returnDocument: 'after', runValidators: true }
  );
}

export async function getCommentsByUserId(userId) {
  return Comment.find({ userId }).sort({ createdAt: -1 }).lean();
}
