import {
  approveFlag,
  createContentFlag,
  fetchAllFlags,
  removeFlaggedTarget,
} from "./flags.services.js";

export async function createFlag(req, res, next) {
  try {
    const flag = await createContentFlag(req.user, req.body || {});
    res.status(201).json(flag);
  } catch (error) {
    next(error);
  }
}

export async function getFlags(req, res, next) {
  try {
    const flags = await fetchAllFlags(req.user);
    res.status(200).json(flags);
  } catch (error) {
    next(error);
  }
}

export async function approveFlagController(req, res, next) {
  try {
    const flag = await approveFlag(req.user, req.params.flagId, req.body?.resolutionNote);
    res.status(200).json(flag);
  } catch (error) {
    next(error);
  }
}

export async function removeFlaggedTargetController(req, res, next) {
  try {
    const flag = await removeFlaggedTarget(req.user, req.params.flagId, req.body?.resolutionNote);
    res.status(200).json(flag);
  } catch (error) {
    next(error);
  }
}
