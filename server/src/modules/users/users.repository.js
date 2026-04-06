import { User } from "./users.model.js";

export async function getAllUsers() {
  return User.find().select('-password').lean();
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

export async function updateUserById(userId, updateData) {
  return User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });
}

export async function deleteUserById(userId) {
  return User.findByIdAndDelete(userId);
}
