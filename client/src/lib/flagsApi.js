import { apiRequest } from "./apiClient";
import { getAuthHeader } from "./auth";

export function createFlag(payload) {
  return apiRequest("/api/flags", {
    method: "POST",
    headers: getAuthHeader("You must be logged in to flag content"),
    body: JSON.stringify(payload),
  });
}

export function getFlags() {
  return apiRequest("/api/flags", {
    headers: getAuthHeader("You must be logged in to view flags"),
  });
}

export function approveFlag(flagId, resolutionNote = "") {
  return apiRequest(`/api/flags/${flagId}/approve`, {
    method: "PATCH",
    headers: getAuthHeader("You must be logged in to manage flags"),
    body: JSON.stringify({ resolutionNote }),
  });
}

export function removeFlaggedTarget(flagId, resolutionNote = "") {
  return apiRequest(`/api/flags/${flagId}/remove`, {
    method: "PATCH",
    headers: getAuthHeader("You must be logged in to manage flags"),
    body: JSON.stringify({ resolutionNote }),
  });
}
