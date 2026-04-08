import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    isDisabled: { type: Boolean, default: false },
    bio: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    favoriteTags: { type: [String], default: [] },
    profileImageUrl: { type: String, trim: true, default: "" },
  },
  { versionKey: false, timestamps: true }
);

export const User = mongoose.model("User", userSchema);
