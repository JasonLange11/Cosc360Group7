import { fetchUsers, registerUser } from "./users.services.js";

export async function getUsers(req, res) {
  const users = await fetchUsers();
  res.json(users);
}

export async function createUserAccount(req, res) {
  const { name, email, password } = req.body;
  const user = await registerUser({ name, email, password });
  res.status(201).json(user);
}