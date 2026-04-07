import { 
    fetchComments,
    fetchUserComments,
    createComment,
    removeComment
} from "./comments.services";

export async function getComments(req, res, next) {
  try {
    const { groupId } = req.params.groupId;
    const comments = await getCommentsByGroupId(groupId);
    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
}

export async function getMyComments(req, res, next) {
  try {
    const comments = await fetchUserComments(req.user);
    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
}

export async function getComment(req, res, next) {
  try {
    const comment = await fetchCommentById(req.params.commentId);
    res.status(200).json(comment);
  } catch (error) {
    next(error);
  }
}

export async function createComment(req, res, next) {
  try {
    const comment = await createComment(req.body);
    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
}

export async function deleteComment(req, res, next) {
  try {
    await removeComment(req.user, req.params.commentId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}