import { Router } from "express";
import {
  createUserAccount,
  deleteUser,
  getMyDashboard,
  getMyProfile,
  getUsers,
  updateProfile,
} from "./users.controller.js";
import { authenticateUser } from "../../middleware/auth.js";

const router = Router();

router.get("/", getUsers);
router.post("/", createUserAccount);
router.get("/me/profile", authenticateUser, getMyProfile);
router.put("/me/profile", authenticateUser, updateProfile);
router.get("/me/dashboard", authenticateUser, getMyDashboard);
router.delete("/:userId", authenticateUser, deleteUser);

export default router;
