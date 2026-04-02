import { Router } from "express";
import { authenticateUser } from "../../middleware/auth.js";
import {
  deleteCommentController,
  getMyCommentsController,
  updateCommentController,
} from "./comments.controller.js";

const router = Router();

router.get("/mine", authenticateUser, getMyCommentsController);
router.put("/:commentId", authenticateUser, updateCommentController);
router.delete("/:commentId", authenticateUser, deleteCommentController);

export default router;
