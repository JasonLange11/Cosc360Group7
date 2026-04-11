import { Router } from "express";
import multer from "multer";
import { authenticateUser } from "../../middleware/auth.js";
import {
  getUploadContent,
  uploadEventBanner,
  uploadGroupBanner,
  uploadProfileImage,
  uploadProfileImageMulter,
} from "./uploads.controller.js";

const router = Router();

function handleUploadMulterErrors(error, req, res, next) {
  if (!error) {
    next();
    return;
  }

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      next(new Error("Image must be 5MB or smaller"));
      return;
    }

    next(new Error("Failed to upload image"));
    return;
  }

  next(error);
}

router.post(
  "/profile-image",
  authenticateUser,
  uploadProfileImageMulter,
  handleUploadMulterErrors,
  uploadProfileImage
);

router.post(
  "/event-banner",
  authenticateUser,
  uploadProfileImageMulter,
  handleUploadMulterErrors,
  uploadEventBanner
);

router.post(
  "/group-banner",
  authenticateUser,
  uploadProfileImageMulter,
  handleUploadMulterErrors,
  uploadGroupBanner
);

router.get("/:uploadId/content", getUploadContent);

export default router;
