import { state } from "../state.js";
import { axis } from "../input.js";
import { endMini, pop } from "../main.js";
import {
  clamp,
  rand,
  dist,
  moveSpeed,
  drawText,
  drawTurtle,
  drawRoundedRect
} from "../draw.js";

function plantCountForScore(score) {
  return clamp(4 + Math.floor(score / 3), 4, 9);
}

function matureDurationForScore(score) {
  return clamp(.95 - score * .035, .38, .95);
}

function createPlant(x, y, score = 0) {
  return {
    x,
    y,
    age: rand(0, .85),
    growSpeed: rand(.34, .54) + score * .008,
    matureStart: rand(1.2, 1.75),
    matureDuration: matureDurationForScore(score),
    big: Math.random() < .18,
    flash: 0,
    wrong: 0
  };
}

function makePlants(count, score = 0) {
  const plants = [];
  let tries = 0;
  const minDistance = 72 * state.SCALE;

  while (plants.length < count && tries < 900) {
    tries++;

    const p = createPlant(
      rand(48 * state.SCALE, state.W - 48 * state.SCALE),
      rand(98 * state.SCALE, state.H - 58 * state.SCALE),
      score
    );

    if (plants.every(o => dist(o.x, o.y, p.x, p.y) > minDistance)) {
      plants.push(p);
    }
  }

  while (plants.length < count) {
    plants.push(createPlant(
      rand(48 * state.SCALE, state.W - 48 * state.SCALE),
      rand(98 * state.SCALE, state.H - 58 * state.SCALE),
      score
    ));
  }

  return plants;
}

function plantStage(p) {
  if (p.age < p.matureStart) return "young";
  if (p.age < p.matureStart + p.matureDuration) return "mature";
  if (p.age < p.matureStart + p.matureDuration + .65) return "old";

  return "dead";
}

export function createBroccoliGame() {
  const m = {
    id: "broccoli",
    time: 55,
    score: 0,
    x: state.W / 2,
    y: state.H * .68,
    speed: moveSpeed(),
    plants: [],
    slow: 0,
    level: 1
  };

  m.plants = makePlants(plantCountForScore(m.score), m.score);

  return m;
}

function nearestPlant(m) {
  let best = null;
  let bd = 9999;

  for (const p of m.plants) {
    const d = dist(m.x, m.y, p.x, p.y);

    if (d < bd) {
      bd = d;
      best = p;
    }
  }

  return { plant: best, d: bd };
}

function resetPlant(p, score) {
  const fresh = createPlant(p.x, p.y, score);

  Object.assign(p, fresh);
}

function harvestBroccoli() {
  const m = state.mini;
  const n = nearestPlant(m);
  const p = n.plant;

  if (!p || n.d > 38 * state.SCALE) {
    pop(m.x, m.y - 22 * state.SCALE, "Yaklaş");
    return;
  }

  const stage = plantStage(p);

  if (stage === "mature") {
    const gain = p.big ? 2 : 1;
    m.score += gain;
    p.flash = .4;

    pop(p.x, p.y, p.big ? "+2 🥦" : "+1 🥦");

    resetPlant(p, m.score);

    const wanted = plantCountForScore(m.score);

    if (m.plants.length < wanted) {
      m.plants.push(createPlant(
        rand(48 * state.SCALE, state.W - 48 * state.SCALE),
        rand(98 * state.SCALE, state.H - 58 * state.SCALE),
        m.score
      ));
    }

    m.level = 1 + Math.floor(m.score / 3);
  } else if (stage === "young") {
    m.time = Math.max(0, m.time - 1.3);
    p.wrong = .5;
    m.slow = .5;

    pop(p.x, p.y, "erken -1.3 sn");
  } else {
    m.time = Math.max(0, m.time - 1.6);
    p.wrong = .5;

    pop(p.x, p.y, "geç -1.6 sn");
    resetPlant(p, m.score);
  }
}

export function updateBroccoliGame(dt) {
  const m = state.mini;

  m.time -= dt;

  if (m.time <= 0) {
    return endMini();
  }

  if (m.slow > 0) {
    m.slow -= dt;
  }

  const a = axis();
  const speed = m.speed * (m.slow > 0 ? .62 : 1);

  if (a.x || a.y) {
    m.x += a.x * speed * dt;
    m.y += a.y * speed * dt;

    if (Math.abs(a.x) > .1) {
      state.turtle.face = a.x > 0 ? 1 : -1;
    }
  }

  m.x = clamp(m.x, 34 * state.SCALE, state.W - 34 * state.SCALE);
  m.y = clamp(m.y, 62 * state.SCALE, state.H - 34 * state.SCALE);

  state.turtle.bob += (a.x || a.y ? 10 : 4) * dt;

  for (const p of m.plants) {
    p.age += p.growSpeed * dt;

    if (p.age > p.matureStart + p.matureDuration + .9) {
      resetPlant(p, m.score);
    }

    if (p.flash > 0) p.flash -= dt;
    if (p.wrong > 0) p.wrong -= dt;
  }

  if (state.keys.action) {
    state.keys.action = false;
    state.actionBuffer = 0;
    harvestBroccoli();
  }
}

function drawPlant(p) {
  const ctx = state.ctx;
  const stage = plantStage(p);
  const near = dist(state.mini.x, state.mini.y, p.x, p.y) < 60 * state.SCALE;

  ctx.save();
  ctx.translate(p.x, p.y);

  ctx.fillStyle = "rgba(95, 104, 54, .18)";
  ctx.beginPath();
  ctx.ellipse(0, 18 * state.SCALE, 24 * state.SCALE, 9 * state.SCALE, 0, 0, Math.PI * 2);
  ctx.fill();

  if (stage === "young") {
    ctx.fillStyle = "#77c768";

    ctx.beginPath();
    ctx.ellipse(-8 * state.SCALE, 0, 9 * state.SCALE, 18 * state.SCALE, -.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(8 * state.SCALE, 0, 9 * state.SCALE, 18 * state.SCALE, .4, 0, Math.PI * 2);
    ctx.fill();

    drawText("·", 0, -6 * state.SCALE, 22 * state.SCALE, "center", "#4f7f43", "900");
  }

  if (stage === "mature") {
    ctx.fillStyle = p.flash > 0 ? "#d4ff9e" : "#5eba5f";

    const size = p.big ? 1.18 : 1;

    for (const c of [[0, -8], [-12, 0], [12, 0], [-6, -14], [6, -14]]) {
      ctx.beginPath();
      ctx.arc(c[0] * state.SCALE, c[1] * state.SCALE, 11 * state.SCALE * size, 0, Math.PI * 2);
      ctx.fill();
    }

    drawText("🥦", 0, 2 * state.SCALE, 21 * state.SCALE * size);
  }

  if (stage === "old" || stage === "dead") {
    ctx.fillStyle = "#b7a660";

    for (const c of [[0, -8], [-10, 0], [10, 0], [0, -15]]) {
      ctx.beginPath();
      ctx.arc(c[0] * state.SCALE, c[1] * state.SCALE, 9 * state.SCALE, 0, Math.PI * 2);
      ctx.fill();
    }

    drawText("🥦", 0, 2 * state.SCALE, 19 * state.SCALE);
  }

  if (near) {
    ctx.strokeStyle = stage === "mature" ? "rgba(255,255,255,.95)" : "rgba(255,255,255,.55)";
    ctx.lineWidth = 3 * state.SCALE;
    ctx.beginPath();
    ctx.arc(0, 0, 30 * state.SCALE, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (p.wrong > 0) {
    drawText("!", 0, -30 * state.SCALE, 18 * state.SCALE, "center", "#8a5137", "900");
  }

  ctx.restore();
}

export function drawBroccoliGame() {
  const ctx = state.ctx;
  const m = state.mini;

  ctx.fillStyle = "#c9edc2";
  ctx.fillRect(0, 0, state.W, state.H);

  drawText("Tam Kıvamında Brokoli", state.W / 2, 30 * state.SCALE, 21 * state.SCALE, "center", "#4f7f43", "900");

  drawText(
    `Kademe ${m.level}  •  Olgunken TOPLA  •  Erken/geç ceza`,
    state.W / 2,
    54 * state.SCALE,
    11.5 * state.SCALE,
    "center",
    "#5f6441",
    "800"
  );

  for (const p of m.plants) {
    drawPlant(p);
  }

  drawTurtle(m.x, m.y, .95, "happy");

  drawText(
    `Brokoli: ${m.score}  •  Fide sayısı: ${m.plants.length}`,
    state.W / 2,
    state.H - 18 * state.SCALE,
    15 * state.SCALE,
    "center",
    "#4b3b2f",
    "800"
  );

  if (m.slow > 0) {
    drawText(
      "Erken hasat kaplumbağayı şaşırttı.",
      state.W / 2,
      state.H - 40 * state.SCALE,
      12 * state.SCALE,
      "center",
      "#6d5b44",
      "800"
    );
  }
}
