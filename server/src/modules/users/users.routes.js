import { Router } from "express";
import { getUsers, createUserAccount } from "./users.controller.js";

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

/**
 * @openapi
 * /api/users:
 *   post:
 *     summary: Create a user
 *     description: Creates a new user with name, email, and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Alice
 *               email:
 *                 type: string
 *                 example: alice@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: User created successfully
 */
router.post("/", createUserAccount);

export default router;