import { User } from "./users.model.js";

export async function getAllUsers() {
  // Excludes admins and do not return password. SAFETY!
  return User.find({ isAdmin: false }).select('-password').lean();
}

export async function createUser(userData) {
  return User.create(userData);
}

export async function findUserByEmail(email){
  return User.findOne({email});
}

export async function findUserById(userId) {
  return User.findById(userId);
}