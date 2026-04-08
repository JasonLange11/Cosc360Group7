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
    isDisabled: Boolean(user.isDisabled),
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

function ensureAdminRequest(requestUser) {
  if (!requestUser) {
    throw new Error("Authentication required");
  }

  if (!requestUser.isAdmin) {
    throw new Error("Admin access required");
  }
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

export async function setUserDisabledStatus(requestUser, targetUserId, isDisabled) {
  ensureAdminRequest(requestUser);

  const existingUser = await findUserById(targetUserId);

  if (!existingUser) {
    throw new Error("User not found");
  }

  if (existingUser.isAdmin) {
    throw new Error("Cannot disable admin user");
  }

  const updatedUser = await updateUserById(targetUserId, {
    isDisabled: Boolean(isDisabled),
  });

  return toSafeProfile(updatedUser);
}

export async function setUserAdminStatus(requestUser, targetUserId, isAdmin) {
  ensureAdminRequest(requestUser);

  const existingUser = await findUserById(targetUserId);

  if (!existingUser) {
    throw new Error("User not found");
  }

  const nextAdminState = Boolean(isAdmin);
  const isSelfUpdate = requestUser.id?.toString() === targetUserId.toString();

  if (isSelfUpdate && !nextAdminState) {
    throw new Error("Admins cannot remove their own admin access");
  }

  const updatedUser = await updateUserById(targetUserId, {
    isAdmin: nextAdminState,
  });

  return toSafeProfile(updatedUser);
}

export async function updateUserProfileAsAdmin(requestUser, targetUserId, updateData = {}) {
  ensureAdminRequest(requestUser);

  const existingUser = await findUserById(targetUserId);

  if (!existingUser) {
    throw new Error("User not found");
  }

  const hasNameUpdate = typeof updateData.name === "string" && updateData.name.trim().length > 0;
  const hasBioUpdate = typeof updateData.bio === "string";
  const hasLocationUpdate = typeof updateData.location === "string";
  const hasFavoriteTagsUpdate = updateData.favoriteTags !== undefined;

  if (!hasNameUpdate && !hasBioUpdate && !hasLocationUpdate && !hasFavoriteTagsUpdate) {
    throw new Error("At least one profile field is required");
  }

  const nextData = {
    bio: updateData.bio ?? existingUser.bio,
    location: updateData.location ?? existingUser.location,
    favoriteTags:
      updateData.favoriteTags === undefined
        ? existingUser.favoriteTags || []
        : parseFavoriteTags(updateData.favoriteTags),
  };

  if (hasNameUpdate) {
    nextData.name = updateData.name.trim();
  }

  const updatedUser = await updateUserById(targetUserId, nextData);
  return toSafeProfile(updatedUser);
}
