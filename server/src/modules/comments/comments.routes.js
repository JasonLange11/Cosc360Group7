import { Router } from "express";
import { authenticateUser, optionalAuthenticateUser } from "../../middleware/auth.js";
import {
	createComment,
	deleteComment,
	getComment,
	getComments,
	getMyComments
} from "./comments.controller.js";

const router = Router();

router.get("/", getComments);
router.get("/mine", authenticateUser, getMyComments);
router.get("/:commentId", getComment);

router.post("/", optionalAuthenticateUser, createComment);
router.delete("/:commentId", authenticateUser, deleteComment);

export default router;