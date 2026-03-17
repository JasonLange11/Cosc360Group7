import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    bannerImage: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    eventDate: {
      type: Date,
      required: true,
    },
    eventTime: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    cost: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
  },
  { versionKey: false }
);

export const Event = mongoose.model("Event", eventSchema);