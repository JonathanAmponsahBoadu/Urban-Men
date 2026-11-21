"use client";

/** Shrinks a photo to a JPEG data URL so it fits in browser storage (~100–200 KB). */
export async function compressImage(file: File, maxSide = 1000, quality = 0.8): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("That file is not an image.");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process the image.");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", quality);
}

/**
 * Compress then upload a product image to Cloudinary via unsigned preset.
 * Returns the Cloudinary secure URL.
 * Pass an `onProgress` callback to get per-file progress (0–100).
 *
 * Requires env vars:
 *   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
 *   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
 */
export async function uploadProductImage(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("That file is not an image.");

  // 1. Compress first so the upload is fast
  const dataUrl = await compressImage(file, 1200, 0.82);
  const blob = await (await fetch(dataUrl)).blob();

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.");
  }

  const form = new FormData();
  form.append("file", blob, file.name);
  form.append("upload_preset", uploadPreset);

  // 2. Use XHR so we can report upload progress
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

    if (onProgress) {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });
    }

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const json = JSON.parse(xhr.responseText) as { secure_url: string };
          resolve(json.secure_url);
        } catch {
          reject(new Error("Unexpected response from image server."));
        }
      } else {
        let msg = `Image upload failed (${xhr.status}).`;
        try {
          const json = JSON.parse(xhr.responseText) as { error?: { message?: string } };
          if (json.error?.message) msg = json.error.message;
        } catch { /* ignore */ }
        reject(new Error(msg));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error while uploading image.")));
    xhr.addEventListener("abort", () => reject(new Error("Image upload was cancelled.")));

    xhr.send(form);
  });
}
