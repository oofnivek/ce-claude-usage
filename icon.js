// Draws the toolbar icon: a Claude-style orange starburst with the usage % on top.
const CLAUDE_ORANGE = "#D97757";
const SIZES = [16, 32];

// Ray lengths (fraction of radius) vary a little to mimic the hand-drawn Claude mark.
const RAYS = [1, 0.86, 0.96, 0.82, 1, 0.9, 0.84, 0.98, 0.88, 0.94, 0.8, 0.92];

function drawStarburst(ctx, size, color) {
  const c = size / 2;
  const r = size / 2;
  ctx.fillStyle = color;
  RAYS.forEach((len, i) => {
    const a = (i / RAYS.length) * Math.PI * 2 - Math.PI / 2;
    const w = size * 0.07; // half-width of the ray at its base
    const tip = r * len;
    const dx = Math.cos(a), dy = Math.sin(a);
    const px = -dy * w, py = dx * w;
    ctx.beginPath();
    ctx.moveTo(c + px, c + py);
    ctx.lineTo(c + dx * tip + px * 0.45, c + dy * tip + py * 0.45);
    ctx.lineTo(c + dx * tip - px * 0.45, c + dy * tip - py * 0.45);
    ctx.lineTo(c - px, c - py);
    ctx.closePath();
    ctx.fill();
  });
  ctx.beginPath();
  ctx.arc(c, c, r * 0.22, 0, Math.PI * 2);
  ctx.fill();
}

function drawText(ctx, size, text) {
  if (!text) return;
  // Shrink the font for wider strings like "100" so it stays inside the icon.
  const scale = text.length >= 3 ? 0.56 : 0.78;
  ctx.font = `bold ${Math.round(size * scale)}px system-ui, Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const x = size / 2, y = size / 2 + size * 0.04;
  ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(2, size * 0.16);
  ctx.strokeStyle = "rgba(20, 20, 19, 0.9)";
  ctx.strokeText(text, x, y);
  ctx.fillStyle = "#ffffff";
  ctx.fillText(text, x, y);
}

export async function setIcon(text, color = CLAUDE_ORANGE) {
  const imageData = {};
  for (const size of SIZES) {
    const canvas = new OffscreenCanvas(size, size);
    const ctx = canvas.getContext("2d");
    drawStarburst(ctx, size, color);
    drawText(ctx, size, text);
    imageData[size] = ctx.getImageData(0, 0, size, size);
  }
  await chrome.action.setIcon({ imageData });
}
