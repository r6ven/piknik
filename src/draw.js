import { state } from "./state.js";

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const rand = (a, b) => a + Math.random() * (b - a);
export const dist = (a, b, c, d) => Math.hypot(a - c, b - d);

export function stationX(st) {
  return st.rx * state.W;
}

export function stationY(st) {
  return st.ry * state.H;
}

export function moveSpeed() {
  return clamp(Math.min(state.W, state.H) * .55, 165, 260);
}

export function drawRoundedRect(x, y, w, h, r) {
  const ctx = state.ctx;

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawText(text, x, y, size = 18, align = "center", color = "#4b3b2f", weight = "700") {
  const ctx = state.ctx;

  ctx.save();
  ctx.font = `${weight} ${size}px system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

export function wrapText(text, x, y, maxWidth, fontSize, lineHeight) {
  const ctx = state.ctx;

  ctx.save();
  ctx.font = `800 ${fontSize}px system-ui, sans-serif`;
  ctx.fillStyle = "#4b3b2f";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const words = text.split(" ");
  const lines = [];
  let line = "";

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;

    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }

  if (line) lines.push(line);

  const startY = y - (lines.length - 1) * lineHeight / 2;

  lines.forEach((l, i) => {
    ctx.fillText(l, x, startY + i * lineHeight);
  });

  ctx.restore();
}

export function drawBackground() {
  const ctx = state.ctx;
  const { W, H, SCALE } = state;

  ctx.clearRect(0, 0, W, H);

  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#fff1be");
  grad.addColorStop(.45, "#dff3c8");
  grad.addColorStop(1, "#b9e7c2");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "rgba(255,255,255,.25)";

  for (let i = 0; i < 24; i++) {
    const x = (i * 97 + W * .11) % W;
    const y = (i * 137 + H * .13) % H;

    ctx.beginPath();
    ctx.ellipse(
      x,
      y,
      24 * SCALE + (i % 4) * 5,
      9 * SCALE + (i % 3) * 3,
      (i % 5) * .4,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  ctx.strokeStyle = "rgba(143,111,65,.15)";
  ctx.lineWidth = 18 * SCALE;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(W * .11, H * .78);
  ctx.bezierCurveTo(W * .25, H * .56, W * .32, H * .40, W * .50, H * .45);
  ctx.bezierCurveTo(W * .68, H * .50, W * .74, H * .64, W * .89, H * .77);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,255,255,.34)";
  ctx.lineWidth = 7 * SCALE;

  ctx.beginPath();
  ctx.moveTo(W * .11, H * .78);
  ctx.bezierCurveTo(W * .25, H * .56, W * .32, H * .40, W * .50, H * .45);
  ctx.bezierCurveTo(W * .68, H * .50, W * .74, H * .64, W * .89, H * .77);
  ctx.stroke();
}

export function drawTurtle(x, y, s = 1, mood = "normal") {
  const ctx = state.ctx;
  const turtle = state.turtle;
  s *= state.SCALE;

  ctx.save();
  ctx.translate(x, y + Math.sin(turtle.bob) * 2 * s);
  ctx.scale(s * turtle.face, s);

  ctx.fillStyle = "#82bf63";
  ctx.beginPath();
  ctx.ellipse(26, -6, 16, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#5f9f51";
  ctx.beginPath();
  ctx.ellipse(4, 0, 32, 24, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#97d46f";
  ctx.beginPath();
  ctx.ellipse(4, 0, 23, 17, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(65,93,51,.35)";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(-10, -12);
  ctx.lineTo(14, 12);
  ctx.moveTo(14, -12);
  ctx.lineTo(-10, 12);
  ctx.stroke();

  ctx.fillStyle = "#77b85e";

  for (const foot of [[-18, -18], [-18, 18], [15, -18], [15, 18]]) {
    ctx.beginPath();
    ctx.ellipse(foot[0], foot[1], 9, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#29351f";
  ctx.beginPath();
  ctx.arc(31, -10, 2.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#29351f";
  ctx.lineWidth = 2;

  ctx.beginPath();

  if (mood === "happy") {
    ctx.arc(33, -4, 5, .15, Math.PI - .15);
  } else {
    ctx.arc(33, -3, 4, .2, Math.PI - .2);
  }

  ctx.stroke();
  ctx.restore();
}
