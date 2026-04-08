import { Router } from "express";
import {
	createUserAccount,
	deleteUser,
	getMyProfile,
	getUsers,
	updateProfile,
	updateUserAdmin,
	updateUserProfile,
	updateUserStatus,
} from "./users.controller.js";
import { authenticateUser, requireAdmin } from "../../middleware/auth.js";

const router = Router();

router.get("/", authenticateUser, requireAdmin, getUsers);
router.post("/", createUserAccount);
router.get("/me/profile", authenticateUser, getMyProfile);
router.put("/me/profile", authenticateUser, updateProfile);
router.put("/:userId/profile", authenticateUser, requireAdmin, updateUserProfile);
router.patch("/:userId/admin", authenticateUser, requireAdmin, updateUserAdmin);
router.patch("/:userId/status", authenticateUser, requireAdmin, updateUserStatus);
router.delete("/:userId", authenticateUser, deleteUser);

export default router;
