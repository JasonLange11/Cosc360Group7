import { Router } from "express";
import { authenticateUser, optionalAuthenticateUser } from "../../middleware/auth.js";
import {
	createComment,
	deleteComment,
	updateComment,
	getComment,
	getComments,
	getMyComments
} from "./comments.controller.js";

const router = Router();

router.get("/", getComments);
router.get("/mine", authenticateUser, getMyComments);
router.get("/:commentId", getComment);

router.post("/", optionalAuthenticateUser, createComment);
router.put("/:commentId", authenticateUser, updateComment);
router.delete("/:commentId", authenticateUser, deleteComment);

export default router;
