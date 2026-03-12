import { fetchUsers } from "./users.services.js";

export function getUsers(req, res) {
  const users = fetchUsers();
  res.json(users);
}