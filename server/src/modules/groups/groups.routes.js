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
	getGroupMembership,
	joinGroupController,
	leaveGroupController
} from "./groups.controller.js";

const router = Router();

router.get("/", getGroups);
router.get("/mine", authenticateUser, getMyGroups);
router.get("/membership", authenticateUser, getGroupMembership);
router.get("/:groupId", getGroup);

router.post("/search", searchGroups);
router.post("/", authenticateUser, createGroup);
router.post("/:groupId/join", authenticateUser, joinGroupController);
router.delete("/:groupId/leave", authenticateUser, leaveGroupController);

router.put("/:groupId", authenticateUser, updateGroup);
router.delete("/:groupId", authenticateUser, deleteGroup);

router.patch("/:groupId/tags", authenticateUser, addTag);
router.delete("/:groupId/tags", authenticateUser, removeTag);

export default router;