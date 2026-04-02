import { Router } from "express";
import { authenticateUser } from "../../middleware/auth.js";
import {
	createEvent,
	deleteEvent,
	getEvent,
	getEvents,
	getMyEvents,
	searchEvents,
	updateEvent,
	addTag,
	removeTag,
} from "./events.controller.js";

const router = Router();

router.get("/", getEvents);
router.get("/mine", authenticateUser, getMyEvents);
router.get("/:eventId", getEvent);

router.post("/search", searchEvents);
router.post("/", authenticateUser, createEvent);
router.put("/:eventId", authenticateUser, updateEvent);
router.delete("/:eventId", authenticateUser, deleteEvent);

router.patch("/:eventId/tags", authenticateUser, addTag);
router.delete("/:eventId/tags", authenticateUser, removeTag);

export default router;