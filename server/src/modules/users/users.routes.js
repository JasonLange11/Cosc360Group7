import { Router } from "express";
import { createUserAccount, deleteUser, getUsers } from "./users.controller.js";
import { authenticateUser } from "../../middleware/auth.js";

const router = Router();

router.get("/", getUsers);

router.post("/", createUserAccount);

router.delete("/:userId", authenticateUser, deleteUser);

export default router;