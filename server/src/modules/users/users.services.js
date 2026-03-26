import { createUser, deleteUserById, findUserById, getAllUsers } from "./users.repository.js";

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