import { Flag } from "./flags.model.js";

export function createFlag(flagData) {
  return Flag.create(flagData);
}

export function getFlagById(flagId) {
  return Flag.findById(flagId).lean();
}

export function findFlagByReporterAndTarget({ targetType, targetId, reporterUserId }) {
  return Flag.findOne({ targetType, targetId, reporterUserId });
}

export function updateFlagById(flagId, updateData) {
  return Flag.findByIdAndUpdate(flagId, updateData, { returnDocument: 'after', runValidators: true }).lean();
}

export function listFlags(filter = {}) {
  return Flag.find(filter).sort({ createdAt: -1 }).lean();
}
