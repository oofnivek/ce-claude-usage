// Draws the toolbar icon: a rounded square in the usage threshold color with the usage % on top.
// Colors and thresholds match the popup's progress bars (popup.css / popup.js).
const OK = "#2e7d32";
const WARN = "#d68910";
const BAD = "#c0392b";
const UNKNOWN = "#777777";
const SIZES = [16, 32];

export function colorFor(pct) {
  if (typeof pct !== "number") return UNKNOWN;
  return pct >= 90 ? BAD : pct >= 70 ? WARN : OK;
}

function drawBackground(ctx, size, color) {
  const r = size * 0.2;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, r);
  ctx.fill();
}

function drawText(ctx, size, text, color) {
  if (!text) return;
  // Shrink the font for wider strings like "100" so it stays inside the icon.
  const scale = text.length >= 3 ? 0.56 : 0.78;
  ctx.font = `bold ${Math.round(size * scale)}px Arial, Helvetica, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // White reads poorly on amber, so use dark digits there.
  ctx.fillStyle = color === WARN ? "#141413" : "#ffffff";
  ctx.fillText(text, Math.round(size / 2), Math.round(size / 2 + size * 0.05));
}

export async function setIcon(text, color) {
  const imageData = {};
  for (const size of SIZES) {
    const canvas = new OffscreenCanvas(size, size);
    const ctx = canvas.getContext("2d");
    drawBackground(ctx, size, color);
    drawText(ctx, size, text, color);
    imageData[size] = ctx.getImageData(0, 0, size, size);
  }
  await chrome.action.setIcon({ imageData });
}
