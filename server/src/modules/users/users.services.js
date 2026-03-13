import { getAllUsers, createUser } from "./users.repository.js";

export async function fetchUsers() {
  return getAllUsers();
}

export async function registerUser(userData) {
  return createUser(userData);
}