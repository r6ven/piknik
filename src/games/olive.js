import { state } from "../state.js";
import { axis } from "../input.js";
import { endMini, pop } from "../main.js";
import {
  clamp,
  rand,
  drawText,
  drawRoundedRect
} from "../draw.js";

export function createOliveGame() {
  return {
    id: "olive",
    time: 55,
    green: 0,
    black: 0,
    missed: 0,
    items: [],
    spawn: .3,
    gate: 0,
    gateText: "ORTA",
    difficulty: 1,
    streak: 0
  };
}

function spawnOlive(m) {
  const roll = Math.random();
  let type = "green";

  if (roll > .66) type = "black";
  if (roll > .86) type = "rotten";

  m.items.push({
    x: state.W / 2 + rand(-10 * state.SCALE, 10 * state.SCALE),
    y: 78 * state.SCALE,
    vx: rand(-10, 10),
    vy: rand(150, 210) + m.difficulty * 15,
    type,
    wobble: rand(0, 10),
    done: false
  });
}

function resolveOlive(item) {
  const m = state.mini;

  if (item.type === "green") {
    if (m.gate === -1) {
      m.green++;
      m.streak++;
      pop(item.x, item.y, "+1 yeşil");
    } else {
      m.time = Math.max(0, m.time - 1.4);
      m.streak = 0;
      m.missed++;
      pop(item.x, item.y, "-1.4 sn");
    }
  }

  if (item.type === "black") {
    if (m.gate === 1) {
      m.black++;
      m.streak++;
      pop(item.x, item.y, "+1 siyah");
    } else {
      m.time = Math.max(0, m.time - 1.4);
      m.streak = 0;
      m.missed++;
      pop(item.x, item.y, "-1.4 sn");
    }
  }

  if (item.type === "rotten") {
    if (m.gate === 0) {
      m.streak++;
      pop(item.x, item.y, "geçti");
    } else {
      m.time = Math.max(0, m.time - 2.2);
      m.streak = 0;
      m.missed++;
      pop(item.x, item.y, "-2.2 sn 🤢");
    }
  }

  if (m.streak > 0 && m.streak % 6 === 0) {
    if (Math.random() < .5) m.green++;
    else m.black++;

    pop(item.x, item.y - 18 * state.SCALE, "seri +1");
  }
}

export function updateOliveGame(dt) {
  const m = state.mini;

  m.time -= dt;

  if (m.time <= 0) {
    return endMini();
  }

  m.difficulty = 1 + Math.floor((55 - m.time) / 11);

  const a = axis();

  if (a.x < -.28) {
    m.gate = -1;
    m.gateText = "YEŞİL";
  } else if (a.x > .28) {
    m.gate = 1;
    m.gateText = "SİYAH";
  } else {
    m.gate = 0;
    m.gateText = "ORTA";
  }

  m.spawn -= dt;

  if (m.spawn <= 0) {
    spawnOlive(m);
    m.spawn = clamp(rand(.52, .78) - m.difficulty * .045, .28, .75);
  }

  for (const item of m.items) {
    item.wobble += dt * 4;
    item.x += (item.vx + Math.sin(item.wobble) * 8) * dt;
    item.y += item.vy * dt;

    item.x = clamp(item.x, state.W * .30, state.W * .70);

    if (!item.done && item.y > state.H - 112 * state.SCALE) {
      item.done = true;
      resolveOlive(item);
    }

    if (item.y > state.H + 50) {
      item.dead = true;
    }
  }

  m.items = m.items.filter(i => !i.dead);
}

function drawOliveItem(item) {
  const ctx = state.ctx;

  ctx.save();
  ctx.translate(item.x, item.y);

  if (item.type === "green") {
    ctx.fillStyle = "#8ea84b";
  } else if (item.type === "black") {
    ctx.fillStyle = "#3f3a32";
  } else {
    ctx.fillStyle = "#936b40";
  }

  ctx.beginPath();
  ctx.ellipse(0, 0, 13 * state.SCALE, 17 * state.SCALE, .25, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,.34)";
  ctx.beginPath();
  ctx.arc(-4 * state.SCALE, -5 * state.SCALE, 3 * state.SCALE, 0, Math.PI * 2);
  ctx.fill();

  if (item.type === "rotten") {
    drawText("×", 0, 0, 15 * state.SCALE, "center", "#fff1d2", "900");
  }

  ctx.restore();
}

export function drawOliveGame() {
  const ctx = state.ctx;
  const m = state.mini;

  ctx.fillStyle = "#e6e6b8";
  ctx.fillRect(0, 0, state.W, state.H);

  drawText("Zeytin Ayıklama", state.W / 2, 32 * state.SCALE, 22 * state.SCALE, "center", "#59613d", "900");

  drawText(
    "Sol: yeşil  •  Sağ: siyah  •  Çürük: ortaya bırak",
    state.W / 2,
    55 * state.SCALE,
    11.5 * state.SCALE,
    "center",
    "#5f6441",
    "800"
  );

  ctx.strokeStyle = "rgba(90,80,48,.28)";
  ctx.lineWidth = 8 * state.SCALE;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(state.W / 2, 80 * state.SCALE);
  ctx.lineTo(state.W / 2, state.H - 116 * state.SCALE);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,255,255,.45)";
  ctx.lineWidth = 3 * state.SCALE;

  ctx.beginPath();
  ctx.moveTo(state.W / 2, 80 * state.SCALE);
  ctx.lineTo(state.W / 2, state.H - 116 * state.SCALE);
  ctx.stroke();

  for (const item of m.items) {
    drawOliveItem(item);
  }

  const gateY = state.H - 112 * state.SCALE;
  const gateX = state.W / 2;

  ctx.save();
  ctx.translate(gateX, gateY);

  ctx.fillStyle = "rgba(255,255,255,.72)";
  drawRoundedRect(-56 * state.SCALE, -22 * state.SCALE, 112 * state.SCALE, 44 * state.SCALE, 18 * state.SCALE);
  ctx.fill();

  ctx.strokeStyle = "#7c6a43";
  ctx.lineWidth = 5 * state.SCALE;
  ctx.lineCap = "round";

  ctx.beginPath();

  if (m.gate === -1) {
    ctx.moveTo(0, 0);
    ctx.lineTo(-42 * state.SCALE, 22 * state.SCALE);
  } else if (m.gate === 1) {
    ctx.moveTo(0, 0);
    ctx.lineTo(42 * state.SCALE, 22 * state.SCALE);
  } else {
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 26 * state.SCALE);
  }

  ctx.stroke();

  drawText(m.gateText, 0, -36 * state.SCALE, 12 * state.SCALE, "center", "#4b3b2f", "900");

  ctx.restore();

  ctx.fillStyle = "#90b35c";
  drawRoundedRect(28 * state.SCALE, state.H - 62 * state.SCALE, 126 * state.SCALE, 42 * state.SCALE, 14 * state.SCALE);
  ctx.fill();
  drawText("Yeşil", 91 * state.SCALE, state.H - 41 * state.SCALE, 14 * state.SCALE, "center", "#fff", "900");

  ctx.fillStyle = "#4a4036";
  drawRoundedRect(state.W - 154 * state.SCALE, state.H - 62 * state.SCALE, 126 * state.SCALE, 42 * state.SCALE, 14 * state.SCALE);
  ctx.fill();
  drawText("Siyah", state.W - 91 * state.SCALE, state.H - 41 * state.SCALE, 14 * state.SCALE, "center", "#fff", "900");

  drawText(
    `Yeşil: ${m.green}  Siyah: ${m.black}  Seri: ${m.streak}`,
    state.W / 2,
    state.H - 18 * state.SCALE,
    14 * state.SCALE,
    "center",
    "#4b3b2f",
    "800"
  );
}
