import bcrypt from "bcrypt";
import { createUser, deleteUserById, findUserById, getAllUsers, updateUserById } from "./users.repository.js";

const SALT_ROUNDS = 10;

function toSafeProfile(user) {
  return {
    id: user._id,
    email: user.email,
    name: user.name,
    bio: user.bio || "",
    location: user.location || "",
    favoriteTags: user.favoriteTags || [],
    profileImageUrl: user.profileImageUrl || "",
    isAdmin: Boolean(user.isAdmin),
  };
}

function parseFavoriteTags(value) {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value.split(",").map((tag) => tag.trim()).filter(Boolean);
  }

  return [];
}

export async function fetchUsers() {
  return getAllUsers();
}

export async function registerUser(userData) {
  return createUser(userData);
}

export async function removeUser(requestUser, targetUserId) {
  if (!requestUser) {
    throw new Error("Authentication required");
  }

  const existingUser = await findUserById(targetUserId);

  if (!existingUser) {
    throw new Error("User not found");
  }

  const isSelfDelete = requestUser.id?.toString() === targetUserId.toString();

  if (isSelfDelete && requestUser.isAdmin) {
    throw new Error("Admins cannot delete themselves");
  }

  if (isSelfDelete) {
    await deleteUserById(targetUserId);
    return;
  }

  if (!requestUser.isAdmin) {
    throw new Error("Forbidden");
  }

  if (existingUser.isAdmin) {
    throw new Error("Cannot delete admin user");
  }

  await deleteUserById(targetUserId);
}

export async function fetchMyProfile(user) {
  if (!user) {
    throw new Error("Authentication required");
  }

  const existingUser = await findUserById(user.id);

  if (!existingUser) {
    throw new Error("User not found");
  }

  return toSafeProfile(existingUser);
}

export async function updateMyProfile(user, updateData = {}) {
  if (!user) {
    throw new Error("Authentication required");
  }

  const existingUser = await findUserById(user.id);

  if (!existingUser) {
    throw new Error("User not found");
  }

  const hasNameUpdate = typeof updateData.name === "string" && updateData.name.trim().length > 0;
  const hasBioUpdate = typeof updateData.bio === "string";
  const hasLocationUpdate = typeof updateData.location === "string";
  const hasProfileImageUrlUpdate = typeof updateData.profileImageUrl === "string";
  const hasFavoriteTagsUpdate = updateData.favoriteTags !== undefined;
  const hasPasswordUpdate = Boolean(updateData.newPassword);

  if (
    !hasNameUpdate
    && !hasBioUpdate
    && !hasLocationUpdate
    && !hasProfileImageUrlUpdate
    && !hasFavoriteTagsUpdate
    && !hasPasswordUpdate
  ) {
    throw new Error("At least one profile field is required");
  }

  const nextData = {
    bio: updateData.bio ?? existingUser.bio,
    location: updateData.location ?? existingUser.location,
    profileImageUrl: updateData.profileImageUrl ?? existingUser.profileImageUrl,
    favoriteTags:
      updateData.favoriteTags === undefined
        ? existingUser.favoriteTags || []
        : parseFavoriteTags(updateData.favoriteTags),
  };

  if (hasNameUpdate) {
    nextData.name = updateData.name.trim();
  }

  if (updateData.newPassword) {
    if (!updateData.oldPassword) {
      throw new Error("Old password is required to set a new password");
    }

    const passwordIsHashed = typeof existingUser.password === "string" && existingUser.password.startsWith("$2");
    const oldPasswordMatches = passwordIsHashed
      ? await bcrypt.compare(updateData.oldPassword, existingUser.password)
      : updateData.oldPassword === existingUser.password;

    if (!oldPasswordMatches) {
      throw new Error("Old password is incorrect");
    }

    nextData.password = await bcrypt.hash(updateData.newPassword, SALT_ROUNDS);
  }

  const updatedUser = await updateUserById(user.id, nextData);
  return toSafeProfile(updatedUser);
}
