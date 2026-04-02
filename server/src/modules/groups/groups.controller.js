import {
  createUserGroup,
  editGroup,
  fetchMyGroups,
  joinGroup,
  leaveGroup,
  removeGroup,
} from "./groups.services.js";

export async function createGroupController(req, res, next) {
  try {
    const group = await createUserGroup(req.user, req.body);
    res.status(201).json(group);
  } catch (error) {
    next(error);
  }
}

export async function getMyGroupsController(req, res, next) {
  try {
    const groups = await fetchMyGroups(req.user);
    res.status(200).json(groups);
  } catch (error) {
    next(error);
  }
}

export async function updateGroupController(req, res, next) {
  try {
    const group = await editGroup(req.user, req.params.groupId, req.body);
    res.status(200).json(group);
  } catch (error) {
    next(error);
  }
}

export async function deleteGroupController(req, res, next) {
  try {
    await removeGroup(req.user, req.params.groupId);
    res.status(204).send();
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
