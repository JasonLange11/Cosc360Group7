import { Upload } from "./uploads.model.js";

export async function createUpload(uploadData) {
  return Upload.create(uploadData);
}

export async function getUploadById(uploadId) {
  return Upload.findById(uploadId);
}

export async function deleteUploadsByOwnerAndContext(ownerUserId, context, excludeUploadId = null) {
  const filter = { ownerUserId, context };

  if (excludeUploadId) {
    filter._id = { $ne: excludeUploadId };
  }

  return Upload.deleteMany(filter);
}
