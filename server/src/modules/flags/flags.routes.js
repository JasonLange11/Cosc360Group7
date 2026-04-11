import { Router } from "express";
import { authenticateUser, requireAdmin } from "../../middleware/auth.js";
import {
  approveFlagController,
  createFlag,
  getFlags,
  removeFlaggedTargetController,
} from "./flags.controller.js";

const router = Router();

router.post("/", authenticateUser, createFlag);
router.get("/", authenticateUser, requireAdmin, getFlags);
router.patch("/:flagId/approve", authenticateUser, requireAdmin, approveFlagController);
router.patch("/:flagId/remove", authenticateUser, requireAdmin, removeFlaggedTargetController);

export default router;
