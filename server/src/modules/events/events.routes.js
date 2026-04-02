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
} from "./events.controller.js";
import {
  createEventCommentController,
  getEventCommentsController,
} from "../comments/comments.controller.js";

const router = Router();

router.get("/", getEvents);
router.get("/mine", authenticateUser, getMyEvents);
router.get("/attending", authenticateUser, getAttendingEvents);
router.get("/:eventId", getEvent);
router.get("/:eventId/comments", getEventCommentsController);

router.post("/search", searchEvents);
router.post("/", authenticateUser, createEvent);
router.post("/:eventId/attend", authenticateUser, attendEventController);
router.post("/:eventId/comments", authenticateUser, createEventCommentController);

router.put("/:eventId", authenticateUser, updateEvent);
router.delete("/:eventId", authenticateUser, deleteEvent);
router.delete("/:eventId/attend", authenticateUser, unattendEventController);

export default router;
