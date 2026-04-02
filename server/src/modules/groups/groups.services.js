import {
  createGroup,
  deleteGroupById,
  getGroupById,
  getGroupsByMemberId,
  updateGroupById,
} from "./groups.repository.js";

function toPlainGroup(group) {
  return typeof group?.toObject === "function" ? group.toObject() : group;
}

function canManageGroup(user, group) {
  if (!user || !group) {
    return false;
  }

  if (user.isAdmin) {
    return true;
  }

  return group.ownerId.toString() === user.id.toString();
}

export async function createUserGroup(user, groupData) {
  if (!user) {
    throw new Error("Authentication required");
  }

  if (!groupData?.name?.trim()) {
    throw new Error("Group name is required");
  }

  const group = await createGroup({
    name: groupData.name,
    description: groupData.description || "",
    ownerId: user.id,
    members: [user.id],
  });

  return toPlainGroup(group);
}

export async function fetchMyGroups(user) {
  if (!user) {
    throw new Error("Authentication required");
  }

  return getGroupsByMemberId(user.id);
}

export async function editGroup(user, groupId, updateData) {
  const existingGroup = await getGroupById(groupId);

  if (!existingGroup) {
    throw new Error("Group not found");
  }

  if (!canManageGroup(user, existingGroup)) {
    throw new Error("Forbidden");
  }

  return updateGroupById(groupId, {
    name: updateData.name,
    description: updateData.description,
  });
}

export async function removeGroup(user, groupId) {
  const existingGroup = await getGroupById(groupId);

  if (!existingGroup) {
    throw new Error("Group not found");
  }

  if (!canManageGroup(user, existingGroup)) {
    throw new Error("Forbidden");
  }

  await deleteGroupById(groupId);
}

export async function joinGroup(user, groupId) {
  if (!user) {
    throw new Error("Authentication required");
  }

  const existingGroup = await getGroupById(groupId);

  if (!existingGroup) {
    throw new Error("Group not found");
  }

  const alreadyMember = existingGroup.members.some((memberId) => memberId.toString() === user.id.toString());

  if (!alreadyMember) {
    existingGroup.members.push(user.id);
    await existingGroup.save();
  }

  return toPlainGroup(existingGroup);
}

export async function leaveGroup(user, groupId) {
  if (!user) {
    throw new Error("Authentication required");
  }

  const existingGroup = await getGroupById(groupId);

  if (!existingGroup) {
    throw new Error("Group not found");
  }

  existingGroup.members = existingGroup.members.filter((memberId) => memberId.toString() !== user.id.toString());
  await existingGroup.save();

  return toPlainGroup(existingGroup);
}
