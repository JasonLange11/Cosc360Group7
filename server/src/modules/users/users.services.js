import { getAllUsers } from "./users.repository.js";

export function fetchUsers() {
  return getAllUsers();
}