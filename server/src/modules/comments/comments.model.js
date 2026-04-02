import mongoose from "mongoose";

const eventCommentSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: { type: String, required: true, trim: true, maxlength: 1500 },
  },
  { versionKey: false, timestamps: true }
);

export const EventComment = mongoose.model("EventComment", eventCommentSchema);
