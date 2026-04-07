import {
  createUserGroup,
  editGroup,
  fetchGroupById,
  fetchGroups,
  fetchMyGroups,
  filterGroups,
  removeGroup,
  addGroupTag,
  removeGroupTag,
  joinGroup,
  leaveGroup,
  fetchGroupMembership
} from "./groups.services.js";

export async function getGroups(req, res, next) {
  try {
    const groups = await fetchGroups();
    res.status(200).json(groups);
  } catch (error) {
    next(error);
  }
}

export async function searchGroups(req, res, next) {
  try {
    const searchTerm = String(req.body.searchTerm || "");
    const groups = await filterGroups(searchTerm);
    res.status(200).json(groups);
  } catch (error) {
    next(error);
  }
}

export async function getMyGroups(req, res, next) {
  try {
    const groups = await fetchMyGroups(req.user);
    res.status(200).json(groups);
  } catch (error) {
    next(error);
  }
}

export async function getGroup(req, res, next) {
  try {
    const group = await fetchGroupById(req.params.groupId);
    res.status(200).json(group);
  } catch (error) {
    next(error);
  }
}

export async function createGroup(req, res, next) {
  try {
    const group = await createUserGroup(req.user, req.body);
    res.status(201).json(group);
  } catch (error) {
    next(error);
  }
}

export async function updateGroup(req, res, next) {
  try {
    const group = await editGroup(req.user, req.params.groupId, req.body);
    res.status(200).json(group);
  } catch (error) {
    next(error);
  }
}

export async function deleteGroup(req, res, next) {
  try {
    await removeGroup(req.user, req.params.groupId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function addTag(req, res, next) {
  try {
    const group = await addGroupTag(req.user, req.params.groupId, req.body.tag);
    res.status(200).json(group);
  } catch (error) {
    next(error);
  }
}

export async function removeTag(req, res, next) {
  try {
    const group = await removeGroupTag(req.user, req.params.groupId, req.body.tag);
    res.status(200).json(group);
  } catch (error) {
    next(error);
  }
}

export async function joinGroupController(req, res, next) {
  try {
    const group = await joinGroup(req.user, req.params.groupId);
    res.status(200).json(group);
  } catch (error) {
    next(error);
  }
}

export async function leaveGroupController(req, res, next) {
  try {
    const group = await leaveGroup(req.user, req.params.groupId);
    res.status(200).json(group);
  } catch (error) {
    next(error);
  }
}

export async function getGroupMembership(req, res, next) {
  try {
    const groups = await fetchGroupMembership(req.user);
    res.status(200).json(groups);
  } catch (error) {
    next(error);
  }
}