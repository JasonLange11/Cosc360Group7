import multer from "multer";
import {
  createProfileImageUpload,
  createEventBannerUpload,
  getMaxUploadSizeBytes,
  isAllowedImageMimeType,
  fetchUploadContent,
} from "./uploads.services.js";

const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: getMaxUploadSizeBytes(),
  },
  fileFilter(req, file, callback) {
    if (!isAllowedImageMimeType(file.mimetype)) {
      callback(new Error("Only image uploads are allowed"));
      return;
    }

    callback(null, true);
  },
});

function buildUploadUrl(req, uploadId) {
  return `${req.protocol}://${req.get("host")}/api/uploads/${uploadId}/content`;
}

export const uploadProfileImageMulter = uploadMiddleware.single("image");

export async function uploadProfileImage(req, res, next) {
  try {
    const upload = await createProfileImageUpload(req.user, req.file);

    res.status(201).json({
      uploadId: upload._id,
      imageUrl: buildUploadUrl(req, upload._id),
      mimeType: upload.mimeType,
      sizeBytes: upload.sizeBytes,
    });
  } catch (error) {
    next(error);
  }
}

export async function uploadEventBanner(req, res, next) {
  try {
    const upload = await createEventBannerUpload(req.user, req.file);

    res.status(201).json({
      uploadId: upload._id,
      imageUrl: buildUploadUrl(req, upload._id),
      mimeType: upload.mimeType,
      sizeBytes: upload.sizeBytes,
    });
  } catch (error) {
    next(error);
  }
}

export async function getUploadContent(req, res, next) {
  try {
    const upload = await fetchUploadContent(req.params.uploadId);
    res.setHeader("Content-Type", upload.mimeType);
    res.setHeader("Content-Length", upload.sizeBytes);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.status(200).send(upload.data);
  } catch (error) {
    next(error);
  }
}
