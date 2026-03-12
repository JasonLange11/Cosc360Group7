import { Router } from "express";
import { getUsers } from "./users.controller.js";

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

export default router;