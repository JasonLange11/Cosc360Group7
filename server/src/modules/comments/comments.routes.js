import { Router } from "express";
import { authenticateUser } from "../../middleware/auth.js";
import {
	createComment,
	deleteComment,
	getComment,
	getComments,
	getMyComments
} from "./comments.controller.js";

const router = Router();

router.get("/:groupId", getComments);
router.get("/mine", authenticateUser, getMyComments);

router.post("/", authenticateUser, createComment);
router.delete("/:commentId", authenticateUser, deleteComment);

export default router;