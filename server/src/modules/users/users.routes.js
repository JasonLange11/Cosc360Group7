import { Router } from "express";
import { createUserAccount, deleteUser, getUsers } from "./users.controller.js";
import { authenticateUser } from "../../middleware/auth.js";

const router = Router();

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Returns a list of users
 *     responses:
 *       200:
 *         description: A list of users
 */

router.get("/", getUsers);

router.post("/", createUserAccount);

router.delete("/:userId", authenticateUser, deleteUser);

export default router;