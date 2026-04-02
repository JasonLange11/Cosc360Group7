import { Group } from "./groups.model.js";

export async function createGroup(groupData) {
  return Group.create(groupData);
}

export async function getGroupsByMemberId(userId) {
  return Group.find({ members: userId }).sort({ createdAt: -1 }).lean();
}

export async function getGroupById(groupId) {
  return Group.findById(groupId);
}

export async function updateGroupById(groupId, updateData) {
  return Group.findByIdAndUpdate(groupId, updateData, { new: true, runValidators: true }).lean();
}

export async function deleteGroupById(groupId) {
  return Group.findByIdAndDelete(groupId);
}
