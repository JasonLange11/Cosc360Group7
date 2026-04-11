import mongoose from "mongoose";

const flagSchema = new mongoose.Schema(
  {
    targetType: {
      type: String,
      enum: ["event", "group", "comment"],
      required: true,
      index: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    reporterUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    reporterName: {
      type: String,
      required: true,
      trim: true,
    },
    reason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    status: {
      type: String,
      enum: ["open", "approved", "removed"],
      default: "open",
      index: true,
    },
    resolvedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolutionNote: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  { versionKey: false, timestamps: true }
);

flagSchema.index({ targetType: 1, targetId: 1, reporterUserId: 1 }, { unique: true });

export const Flag = mongoose.model("Flag", flagSchema);
