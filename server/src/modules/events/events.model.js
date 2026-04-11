import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    attendees: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    bannerImage: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      validate: {
        validator(value) {
          return typeof value === "string" || Buffer.isBuffer(value);
        },
        message: "bannerImage must be a string URL or binary Buffer",
      },
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
      max: 10000,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { versionKey: false, timestamps: true }
);

export const Event = mongoose.model("Event", eventSchema);
