import mongoose from "mongoose";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const uploadSchema = new mongoose.Schema(
  {
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    context: {
      type: String,
      enum: ["profile", "event-banner", "group-banner"],
      required: true,
      index: true,
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
    },
    sizeBytes: {
      type: Number,
      required: true,
      min: 1,
      max: MAX_UPLOAD_BYTES,
    },
    filename: {
      type: String,
      required: true,
      trim: true,
    },
    data: {
      type: Buffer,
      required: true,
    },
  },
  { versionKey: false, timestamps: true }
);

uploadSchema.index({ ownerUserId: 1, context: 1, createdAt: -1 });

export const Upload = mongoose.model("Upload", uploadSchema);
export const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_BYTES;
