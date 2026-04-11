import { getStoredAuthSession } from "./auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export function getMaxUploadSizeBytes() {
  return MAX_UPLOAD_SIZE_BYTES;
}

export function validateImageFile(file) {
  if (!file) {
    throw new Error("Please choose an image file.");
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
    throw new Error("Only JPG, PNG, WEBP, or GIF images are allowed.");
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new Error("Image must be 5MB or smaller.");
  }
}

export function uploadProfileImage(file, onProgress = null) {
  validateImageFile(file);

  const token = getStoredAuthSession()?.token;

  if (!token) {
    return Promise.reject(new Error("You must be logged in to perform this action"));
  }

  const formData = new FormData();
  formData.append("image", file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}/api/uploads/profile-image`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (!onProgress || !event.lengthComputable) {
        return;
      }

      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      let data = null;

      try {
        data = xhr.responseText ? JSON.parse(xhr.responseText) : null;
      } catch {
        data = null;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data);
        return;
      }

      reject(new Error(data?.message || "Failed to upload image"));
    };

    xhr.onerror = () => {
      reject(new Error("Failed to upload image"));
    };

    xhr.send(formData);
  });
}

export function uploadEventBannerImage(file, onProgress = null) {
  validateImageFile(file);

  const token = getStoredAuthSession()?.token;

  if (!token) {
    return Promise.reject(new Error("You must be logged in to perform this action"));
  }

  const formData = new FormData();
  formData.append("image", file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}/api/uploads/event-banner`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (!onProgress || !event.lengthComputable) {
        return;
      }

      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      let data = null;

      try {
        data = xhr.responseText ? JSON.parse(xhr.responseText) : null;
      } catch {
        data = null;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data);
        return;
      }

      reject(new Error(data?.message || "Failed to upload image"));
    };

    xhr.onerror = () => {
      reject(new Error("Failed to upload image"));
    };

    xhr.send(formData);
  });
}

export function uploadGroupBannerImage(file, onProgress = null) {
  validateImageFile(file);

  const token = getStoredAuthSession()?.token;

  if (!token) {
    return Promise.reject(new Error("You must be logged in to perform this action"));
  }

  const formData = new FormData();
  formData.append("image", file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}/api/uploads/group-banner`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (!onProgress || !event.lengthComputable) {
        return;
      }

      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      let data = null;

      try {
        data = xhr.responseText ? JSON.parse(xhr.responseText) : null;
      } catch {
        data = null;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data);
        return;
      }

      reject(new Error(data?.message || "Failed to upload image"));
    };

    xhr.onerror = () => {
      reject(new Error("Failed to upload image"));
    };

    xhr.send(formData);
  });
}
