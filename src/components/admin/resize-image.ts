/**
 * Shrinks a photo in the browser before it is stored: centre-cropped to the
 * 4:3 shape the shop shows, at most `maxWidth` pixels wide (so at most
 * maxWidth × 3/4 tall), saved as a JPEG data URL. Phone photos are often
 * 4–10 MB; this brings them down to roughly 50–150 KB so they fit in browser
 * storage. Very tall or very wide images can no longer be stored at full
 * height or width, and what staff see in the preview is exactly what is saved.
 */
export async function resizeImage(file: File, maxWidth = 800, quality = 0.8): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose a photo (JPEG, PNG or similar).");
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("This photo could not be opened. Try a JPEG or PNG."));
      el.src = url;
    });
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    if (!w || !h) throw new Error("This photo could not be opened. Try a JPEG or PNG.");

    // Centre crop to 4:3.
    const ratio = 4 / 3;
    let sw = w;
    let sh = h;
    if (w / h > ratio) sw = h * ratio;
    else sh = w / ratio;
    const sx = (w - sw) / 2;
    const sy = (h - sh) / 2;

    const scale = Math.min(1, maxWidth / sw);
    const width = Math.max(4, Math.round(sw * scale));
    const height = Math.max(3, Math.round(width / ratio));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Your browser could not process this photo.");
    // JPEG has no transparency: put transparent PNGs on white instead of black.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}
