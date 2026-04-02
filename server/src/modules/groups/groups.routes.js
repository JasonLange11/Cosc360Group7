import { Router } from "express";
import { authenticateUser } from "../../middleware/auth.js";
import {
  createGroupController,
  deleteGroupController,
  getMyGroupsController,
  joinGroupController,
  leaveGroupController,
  updateGroupController,
} from "./groups.controller.js";

const router = Router();

router.post("/", authenticateUser, createGroupController);
router.get("/mine", authenticateUser, getMyGroupsController);
router.put("/:groupId", authenticateUser, updateGroupController);
router.delete("/:groupId", authenticateUser, deleteGroupController);
router.post("/:groupId/join", authenticateUser, joinGroupController);
router.delete("/:groupId/join", authenticateUser, leaveGroupController);

export default router;
