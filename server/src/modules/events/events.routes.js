import { Router } from "express";
import { authenticateUser } from "../../middleware/auth.js";
import { createEvent, deleteEvent, getEvent, getEvents, getMyEvents, updateEvent, } from "./events.controller.js";

const router = Router();

router.get("/", getEvents);
router.get("/mine", authenticateUser, getMyEvents);
router.get("/:eventId", getEvent);

router.post("/", authenticateUser, createEvent);
router.put("/:eventId", authenticateUser, updateEvent);
router.delete("/:eventId", authenticateUser, deleteEvent);

export default router;