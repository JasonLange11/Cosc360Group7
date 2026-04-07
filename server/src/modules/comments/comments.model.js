import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    parentType: {
      type: String,
      enum: ["group", "event"],
      required: true,
      index: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

commentSchema.index({ parentType: 1, parentId: 1, createdAt: -1 });

export const Comment = mongoose.model("Comment", commentSchema);