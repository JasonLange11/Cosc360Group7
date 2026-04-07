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

router.get("/", getComments);
router.get("/mine", authenticateUser, getMyComments);
router.get("/:groupId", getComment);

router.post("/", authenticateUser, createComment);
router.delete("/:groupId", authenticateUser, deleteComment);

export default router;