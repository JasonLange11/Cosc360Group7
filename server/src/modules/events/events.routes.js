import { Router } from "express";
import { authenticateUser } from "../../middleware/auth.js";
import {
	attendEventController,
	createEvent,
	deleteEvent,
	getAttendingEvents,
	getEvent,
	getEvents,
	getMyEvents,
	searchEvents,
	unattendEventController,
	updateEvent,
	addTag,
	removeTag,
} from "./events.controller.js";

const router = Router();

router.get("/", getEvents);
router.get("/mine", authenticateUser, getMyEvents);
router.get("/attending", authenticateUser, getAttendingEvents);
router.get("/:eventId", getEvent);

router.post("/search", searchEvents);
router.post("/", authenticateUser, createEvent);
router.post("/:eventId/attend", authenticateUser, attendEventController);

router.put("/:eventId", authenticateUser, updateEvent);
router.delete("/:eventId", authenticateUser, deleteEvent);
router.delete("/:eventId/attend", authenticateUser, unattendEventController);

router.patch("/:eventId/tags", authenticateUser, addTag);
router.delete("/:eventId/tags", authenticateUser, removeTag);

export default router;
