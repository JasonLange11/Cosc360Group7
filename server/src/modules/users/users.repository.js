import { User } from "./users.model.js";

export async function getAllUsers() {
  return User.find().lean();
}

export async function createUser(userData) {
  return User.create(userData);
}

export async function findUserByEmail(email){
  return User.findOne({email});
}