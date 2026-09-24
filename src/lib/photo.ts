"use client";

/** Max edge length for stored requirement photos (localStorage-friendly). */
const MAX_EDGE = 720;
const JPEG_QUALITY = 0.72;

/**
 * Read a user photo, downscale to a JPEG data URL for local progress storage.
 */
export async function readRequirementPhoto(
  file: File,
): Promise<{ name: string; dataUrl: string }> {
  const name = file.name || "photo.jpg";
  const dataUrl = await compressImageFile(file);
  return { name, dataUrl };
}

function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        const { width, height } = fitWithin(img.naturalWidth, img.naturalHeight, MAX_EDGE);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not prepare photo"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      } catch (err) {
        reject(err instanceof Error ? err : new Error("Could not save photo"));
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read photo"));
    };
    img.src = url;
  });
}

function fitWithin(w: number, h: number, max: number): { width: number; height: number } {
  if (w <= max && h <= max) return { width: w, height: h };
  const scale = Math.min(max / w, max / h);
  return {
    width: Math.max(1, Math.round(w * scale)),
    height: Math.max(1, Math.round(h * scale)),
  };
}
