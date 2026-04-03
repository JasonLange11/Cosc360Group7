import { Group  } from "./groups.model.js";

export async function createGroup(groupData) {
  return Group.create(groupData);
}

export async function getAllGroups() {
  return Group.find().sort({ createdAt: -1 }).lean(); //NOTE: Why is lean used here but not elsewhere?
}

export async function getGroupById(groupId) {
  return Group.findById(groupId);
}

export async function updateGroupById(groupId, updateData) {
  return Group.findByIdAndUpdate(groupId, updateData, {new: true, runValidators: true, });
}

export async function deleteGroupById(groupId) {
  return Group.findByIdAndDelete(groupId);
}

export async function getGroupsByUserId(userId) {
  return Group.find({ userId }).sort({ createdAt: -1 }).lean();
}