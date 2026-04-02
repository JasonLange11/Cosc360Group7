import {
  createEventComment,
  editComment,
  fetchEventComments,
  fetchMyComments,
  removeComment,
} from "./comments.services.js";

export async function createEventCommentController(req, res, next) {
  try {
    const comment = await createEventComment(req.user, req.params.eventId, req.body);
    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
}

export async function getEventCommentsController(req, res, next) {
  try {
    const comments = await fetchEventComments(req.params.eventId);
    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
}

export async function getMyCommentsController(req, res, next) {
  try {
    const comments = await fetchMyComments(req.user);
    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
}

export async function updateCommentController(req, res, next) {
  try {
    const comment = await editComment(req.user, req.params.commentId, req.body);
    res.status(200).json(comment);
  } catch (error) {
    next(error);
  }
}

export async function deleteCommentController(req, res, next) {
  try {
    await removeComment(req.user, req.params.commentId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
