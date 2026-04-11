import {
  createUpload,
  deleteUploadsByOwnerAndContext,
  getUploadById,
} from "./uploads.repository.js";
import { MAX_UPLOAD_SIZE_BYTES } from "./uploads.model.js";

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function assertAllowedMimeType(mimeType) {
  if (!ALLOWED_IMAGE_MIME_TYPES.has(mimeType)) {
    throw new Error("Only image uploads are allowed");
  }
}

export function isAllowedImageMimeType(mimeType) {
  return ALLOWED_IMAGE_MIME_TYPES.has(mimeType);
}

export function getMaxUploadSizeBytes() {
  return MAX_UPLOAD_SIZE_BYTES;
}

export async function createProfileImageUpload(user, file) {
  if (!user) {
    throw new Error("Authentication required");
  }

  if (!file) {
    throw new Error("Image file is required");
  }

  assertAllowedMimeType(file.mimetype);

  if (!Buffer.isBuffer(file.buffer) || !file.buffer.length) {
    throw new Error("Image file is required");
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new Error("Image must be 5MB or smaller");
  }

  const createdUpload = await createUpload({
    ownerUserId: user.id,
    context: "profile",
    mimeType: file.mimetype,
    sizeBytes: file.size,
    filename: file.originalname || "upload",
    data: file.buffer,
  });

  await deleteUploadsByOwnerAndContext(user.id, "profile", createdUpload._id);

  return createdUpload;
}

export async function createEventBannerUpload(user, file) {
  if (!user) {
    throw new Error("Authentication required");
  }

  if (!file) {
    throw new Error("Image file is required");
  }

  assertAllowedMimeType(file.mimetype);

  if (!Buffer.isBuffer(file.buffer) || !file.buffer.length) {
    throw new Error("Image file is required");
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new Error("Image must be 5MB or smaller");
  }

  return createUpload({
    ownerUserId: user.id,
    context: "event-banner",
    mimeType: file.mimetype,
    sizeBytes: file.size,
    filename: file.originalname || "upload",
    data: file.buffer,
  });
}

export async function createGroupBannerUpload(user, file) {
  if (!user) {
    throw new Error("Authentication required");
  }

  if (!file) {
    throw new Error("Image file is required");
  }

  assertAllowedMimeType(file.mimetype);

  if (!Buffer.isBuffer(file.buffer) || !file.buffer.length) {
    throw new Error("Image file is required");
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new Error("Image must be 5MB or smaller");
  }

  return createUpload({
    ownerUserId: user.id,
    context: "group-banner",
    mimeType: file.mimetype,
    sizeBytes: file.size,
    filename: file.originalname || "upload",
    data: file.buffer,
  });
}

export async function fetchUploadContent(uploadId) {
  const upload = await getUploadById(uploadId);

  if (!upload) {
    throw new Error("Upload not found");
  }

  return upload;
}
