import { fetchUsers, registerUser, removeUser } from "./users.services.js";

export async function getUsers(req, res, next) {
  try {
    const users = await fetchUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
}

export async function createUserAccount(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const user = await registerUser({ name, email, password });
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req, res, next){
  try {
    await removeUser(req.user, req.params.userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}