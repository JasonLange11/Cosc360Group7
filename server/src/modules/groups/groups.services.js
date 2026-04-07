import { createGroup, getAllGroups, getGroupById, getGroupsByUserId, updateGroupById, deleteGroupById, fetchGroupMembership } from "./groups.respository.js";
import { findUserById } from "../users/users.repository.js";

function toPlainGroup(group) {
  return typeof group.toObject === "function" ? group.toObject() : group;
}

function canModifyGroup(user, group) {
  if (!user || !group) {
    return false;
  }

  if (user.isAdmin) {
    return true;
  }

  return group.userId.toString() === user.id.toString();
}

async function attachOrganizerName(group) {
  const plainGroup = toPlainGroup(group);

  if (!plainGroup?.userId) {
    return plainGroup;
  }

  const owner = await findUserById(plainGroup.userId);

  return {
    ...plainGroup,
    organizerName: owner?.name || "Unknown Organizer",
  };
}

export async function createUserGroup(user, groupData) {
  if (!user) {
    throw new Error("Authentication required");
  }

  /*
   Might change this so admins can, but just want to 
   keep accounts seperate for now. Admins can edit 
   groups still if they need to edit someones group.
  */
  if(user.isAdmin){
    throw new Error("Admins can not create groups");
  }

  const group = await createGroup({
    ...groupData,
    userId: user.id,
    members: [user.id]
  });

  return toPlainGroup(group);
}

export async function fetchGroups() {
  const groups = await getAllGroups();
  return Promise.all(groups.map((group) => attachOrganizerName(group)));
}

export async function filterGroups(searchTerm) {
  const groups = await fetchGroups();
  const term = searchTerm.trim().toLowerCase();

  if (!term) {
    return groups;
  }

  //Change for group
  return groups.filter((group) => {
    const title = group.name.toLowerCase();
    const location = group.location.toLowerCase();
    const description = group.description.toLowerCase();
    const tags = group.tags;
    tags.forEach((tag) => {tag = tag.toLowerCase()})

    return (
      title.includes(term)
      || location.includes(term)
      || description.includes(term)
      || tags.every(tag => tag.includes(term))
    );
  });
}

export async function fetchGroupById(groupId) {
  const group = await getGroupById(groupId);

  if (!group) {
    throw new Error("Group not found");
  }

  return attachOrganizerName(group);
}

export async function fetchMyGroups(user) {
  if (!user) {
    throw new Error("Authentication required");
  }

  const groups = await getGroupsByUserId(user.id);
  return Promise.all(groups.map((group) => attachOrganizerName(group)));
}

export async function editGroup(user, groupId, updateData) {
  const existingGroup = await getGroupById(groupId);

  if (!existingGroup) {
    throw new Error("Group not found");
  }

  if (!canModifyGroup(user, existingGroup)) {
    throw new Error("Forbidden");
  }

  const updatedGroup = await updateGroupById(groupId, updateData);
  return toPlainGroup(updatedGroup);
}

export async function removeGroup(user, groupId) {
  const existingGroup = await getGroupById(groupId);

  if (!existingGroup) {
    throw new Error("Group not found");
  }

  if (!canModifyGroup(user, existingGroup)) {
    throw new Error("Forbidden");
  }

  await deleteGroupById(groupId);
}

export async function addGroupTag(user, groupId, tag) {
  const existingGroup = await getGroupById(groupId);
  
  if (!existingGroup) {
    throw new Error("Group not found");
  }

  if (!canModifyGroup(user, existingGroup)) {
    throw new Error("Forbidden");
  }

  const cleanedTag = cleanTag(tag);
  const updatedGroup = await addTagToGroup(groupId, cleanedTag);
  return toPlainGroup(updatedGroup);
}

export async function removeGroupTag(user, groupId, tag) {
  const existingGroup = await getGroupById(groupId);
  
  if (!existingGroup) {
    throw new Error("Group not found");
  }

  if (!canModifyGroup(user, existingGroup)) {
    throw new Error("Forbidden");
  }

  const cleanedTag = cleanTag(tag);
  const updatedGroup = await removeTagFromGroup(groupId, cleanedTag);
  return toPlainGroup(updatedGroup);
}

export async function fetchGroupMembership(user) {
  if (!user) {
    throw new Error("Authentication required");
  }

  const events = await fetchGroupMembership(user.id);
  return Promise.all(events.map((event) => attachOrganizerName(event)));
}

export async function joinGroup(user, groupId) {
  if (!user) {
    throw new Error("Authentication required");
  }

  const group = await getGroupById(groupId);

  if (!group) {
    throw new Error("Group not found");
  }

  const isAlreadyMember = group.members.some((memberId) => memberId.toString() === user.id.toString());

  if (!isAlreadyMember) {
    group.members.push(user.id);
    await group.save();
  }

  return attachOrganizerName(group);
}

export async function leaveGroup(user, groupId) {
  if (!user) {
    throw new Error("Authentication required");
  }

  const group = await getGroupById(groupId);

  if (!group) {
    throw new Error("Group not found");
  }

  group.members = group.members.filter((memberId) => memberId.toString() !== user.id.toString());
  await group.save();

  return attachOrganizerName(group);
}
