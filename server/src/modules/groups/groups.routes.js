import { Router } from "express";
import { authenticateUser } from "../../middleware/auth.js";
import {
	createGroup,
	deleteGroup,
	getGroup,
	getGroups,
	getMyGroups,
	searchGroups,
	updateGroup,
	addTag,
	removeTag,
} from "./groups.controller.js";

const router = Router();

router.get("/", getGroups);
router.get("/mine", authenticateUser, getMyGroups);
router.get("/:groupId", getGroup);

router.post("/search", searchGroups);
router.post("/", authenticateUser, createGroup);
router.put("/:groupId", authenticateUser, updateGroup);
router.delete("/:groupId", authenticateUser, deleteGroup);

router.patch("/:groupId/tags", authenticateUser, addTag);
router.delete("/:groupId/tags", authenticateUser, removeTag);

export default router;