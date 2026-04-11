import { deleteCommentById, getCommentById } from "../comments/comments.repository.js";
import { deleteEventById, getEventById } from "../events/events.repository.js";
import { deleteGroupById, getGroupById } from "../groups/groups.respository.js";
import { findUserById } from "../users/users.repository.js";
import {
  createFlag,
  findFlagByReporterAndTarget,
  getFlagById,
  listFlags,
  updateFlagById,
} from "./flags.repository.js";

function ensureAuthenticated(user) {
  if (!user) {
    throw new Error("Authentication required");
  }
}

function ensureAdmin(user) {
  ensureAuthenticated(user);

  if (!user.isAdmin) {
    throw new Error("Admin access required");
  }
}

function toObjectIdString(value) {
  return value?.toString ? value.toString() : String(value || "");
}

async function fetchTarget(targetType, targetId) {
  if (targetType === "event") {
    return getEventById(targetId);
  }

  if (targetType === "group") {
    return getGroupById(targetId);
  }

  if (targetType === "comment") {
    return getCommentById(targetId);
  }

  throw new Error("Invalid flag target type");
}

async function removeTarget(targetType, targetId) {
  if (targetType === "event") {
    await deleteEventById(targetId);
    return;
  }

  if (targetType === "group") {
    await deleteGroupById(targetId);
    return;
  }

  if (targetType === "comment") {
    await deleteCommentById(targetId);
    return;
  }

  throw new Error("Invalid flag target type");
}

async function buildTargetSummary(targetType, target) {
  if (!target) {
    return {
      exists: false,
      title: "Removed item",
      preview: "This flagged item has already been removed.",
      ownerName: "Unknown",
    };
  }

  if (targetType === "event") {
    const owner = target.userId ? await findUserById(target.userId) : null;

    return {
      exists: true,
      title: target.title || "Untitled event",
      preview: target.description || "",
      ownerName: owner?.name || "Unknown",
    };
  }

  if (targetType === "group") {
    const owner = target.userId ? await findUserById(target.userId) : null;

    return {
      exists: true,
      title: target.name || "Untitled group",
      preview: target.description || "",
      ownerName: owner?.name || "Unknown",
    };
  }

  if (targetType === "comment") {
    const owner = target.userId ? await findUserById(target.userId) : null;

    return {
      exists: true,
      title: `Comment on ${target.parentType || "item"}`,
      preview: target.content || "",
      ownerName: owner?.name || target.username || "Unknown",
    };
  }

  return {
    exists: false,
    title: "Unknown item",
    preview: "",
    ownerName: "Unknown",
  };
}

export async function createContentFlag(user, { targetType, targetId, reason = "" }) {
  ensureAuthenticated(user);

  if (!targetType || !targetId) {
    throw new Error("Flag target type and id are required");
  }

  const target = await fetchTarget(targetType, targetId);

  if (!target) {
    throw new Error("Flag target not found");
  }

  const targetOwnerId = target.userId ? toObjectIdString(target.userId) : "";

  if (targetOwnerId && targetOwnerId === toObjectIdString(user.id)) {
    throw new Error("You cannot flag your own content");
  }

  const existingFlag = await findFlagByReporterAndTarget({
    targetType,
    targetId,
    reporterUserId: user.id,
  });

  if (existingFlag) {
    throw new Error("You have already flagged this item");
  }

  return createFlag({
    targetType,
    targetId,
    reporterUserId: user.id,
    reporterName: user.name || user.email || "Unknown",
    reason: String(reason || "").trim(),
  });
}

export async function fetchAllFlags(adminUser) {
  ensureAdmin(adminUser);

  const flags = await listFlags();

  return Promise.all(
    flags.map(async (flag) => {
      const target = await fetchTarget(flag.targetType, flag.targetId);
      const summary = await buildTargetSummary(flag.targetType, target);

      return {
        ...flag,
        target: {
          id: flag.targetId,
          type: flag.targetType,
          ...summary,
        },
      };
    })
  );
}

export async function approveFlag(adminUser, flagId, resolutionNote = "") {
  ensureAdmin(adminUser);

  const existingFlag = await getFlagById(flagId);

  if (!existingFlag) {
    throw new Error("Flag not found");
  }

  return updateFlagById(flagId, {
    status: "approved",
    resolvedByUserId: adminUser.id,
    resolvedAt: new Date(),
    resolutionNote: String(resolutionNote || "").trim(),
  });
}

export async function removeFlaggedTarget(adminUser, flagId, resolutionNote = "") {
  ensureAdmin(adminUser);

  const existingFlag = await getFlagById(flagId);

  if (!existingFlag) {
    throw new Error("Flag not found");
  }

  await removeTarget(existingFlag.targetType, existingFlag.targetId);

  return updateFlagById(flagId, {
    status: "removed",
    resolvedByUserId: adminUser.id,
    resolvedAt: new Date(),
    resolutionNote: String(resolutionNote || "").trim(),
  });
}
