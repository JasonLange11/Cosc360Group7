import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
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
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    tags: {
    type: [String],
    required: true,
    validate: {
        validator: function (tags) {
            return tags.length > 0 && tags.every(tag => tag.length > 0 && tag.length <= 50);
        },
        message: 'Tags must be a non-empty array with each tag being a non-empty string (max 50 characters).'
    },
    set: function (tags) {
        // Normalize: trim whitespace, convert to lowercase, remove duplicates and empty strings
        const normalized = [...new Set(
            tags
            .filter(tag => typeof tag === 'string' && tag.trim().length > 0)
            .map(tag => tag.trim().toLowerCase())
        )];
        return normalized.slice(0, 10); // Limit to 10 tags
        }
    }
  },
  { versionKey: false }
);

export const Group = mongoose.model("Group", groupSchema);