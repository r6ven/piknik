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
  drawRoundedRect,
  wrapText
} from "../draw.js";

function greensDifficulty(wave) {
  return {
    leafCount: clamp(8 + wave * 2, 10, 24),
    needGreens: clamp(2 + Math.ceil(wave * .55), 3, 8),
    needSorrel: clamp(1 + Math.floor(wave * .55), 2, 7)
  };
}

function makeLeafPositions(count) {
  const leaves = [];
  let tries = 0;

  const minDistance = clamp((78 - count * 1.25) * state.SCALE, 40 * state.SCALE, 66 * state.SCALE);

  while (leaves.length < count && tries < 1400) {
    tries++;

    const leaf = {
      x: rand(46 * state.SCALE, state.W - 46 * state.SCALE),
      y: rand(92 * state.SCALE, state.H - 58 * state.SCALE),
      type: "weed",
      picked: false,
      wrong: false,
      wiggle: rand(0, 10)
    };

    if (leaves.every(o => dist(o.x, o.y, leaf.x, leaf.y) > minDistance)) {
      leaves.push(leaf);
    }
  }

  while (leaves.length < count) {
    leaves.push({
      x: rand(46 * state.SCALE, state.W - 46 * state.SCALE),
      y: rand(92 * state.SCALE, state.H - 58 * state.SCALE),
      type: "weed",
      picked: false,
      wrong: false,
      wiggle: rand(0, 10)
    });
  }

  return leaves;
}

function shuffle(arr) {
  return arr
    .map(v => ({ v, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(o => o.v);
}

function newGreensWave(m) {
  m.wave++;

  const d = greensDifficulty(m.wave);

  m.needGreens = d.needGreens;
  m.needSorrel = d.needSorrel;
  m.foundGreens = 0;
  m.foundSorrel = 0;
  m.cooldown = 0;

  m.leaves = makeLeafPositions(d.leafCount);

  const shuffled = shuffle(m.leaves);
  const greensTargets = shuffled.slice(0, m.needGreens);
  const sorrelTargets = shuffled.slice(m.needGreens, m.needGreens + m.needSorrel);

  for (const leaf of greensTargets) {
    leaf.type = "greens";
  }

  for (const leaf of sorrelTargets) {
    leaf.type = "sorrel";
  }
}

export function createGreensGame() {
  const m = {
    id: "greens",
    time: 55,
    greens: 0,
    sorrel: 0,
    hearts: 0,
    x: state.W / 2,
    y: state.H * .68,
    speed: moveSpeed(),
    wave: 0,
    leaves: [],
    needGreens: 0,
    needSorrel: 0,
    foundGreens: 0,
    foundSorrel: 0,
    combo: 0,
    slow: 0,
    cooldown: 0
  };

  newGreensWave(m);

  return m;
}

function nearestLeaf(m) {
  let best = null;
  let bd = 9999;

  for (const leaf of m.leaves) {
    if (leaf.picked) continue;

    const d = dist(m.x, m.y, leaf.x, leaf.y);

    if (d < bd) {
      bd = d;
      best = leaf;
    }
  }

  return { leaf: best, d: bd };
}

function inspectLeaf() {
  const m = state.mini;

  if (m.cooldown > 0) return;

  const n = nearestLeaf(m);
  const leaf = n.leaf;

  if (!leaf || n.d > 35 * state.SCALE) {
    pop(m.x, m.y - 22 * state.SCALE, "Yaklaş");
    return;
  }

  if (leaf.type === "greens" && m.foundGreens < m.needGreens) {
    leaf.picked = true;
    m.greens++;
    m.foundGreens++;
    m.combo++;

    pop(leaf.x, leaf.y, "+1 tere 🌿");

    if (m.combo > 0 && m.combo % 4 === 0) {
      m.hearts++;
      pop(leaf.x, leaf.y - 18 * state.SCALE, "+1 ❤️");
    }
  } else if (leaf.type === "sorrel" && m.foundSorrel < m.needSorrel) {
    leaf.picked = true;
    m.sorrel++;
    m.foundSorrel++;
    m.combo++;

    pop(leaf.x, leaf.y, "+1 kuzu kulağı 🍃");

    if (m.combo > 0 && m.combo % 4 === 0) {
      m.hearts++;
      pop(leaf.x, leaf.y - 18 * state.SCALE, "+1 ❤️");
    }
  } else {
    leaf.wrong = true;
    leaf.picked = true;
    m.combo = 0;
    m.slow = .9;
    m.time = Math.max(0, m.time - 1.8);

    pop(leaf.x, leaf.y, "-1.8 sn ot");
  }

  if (m.foundGreens >= m.needGreens && m.foundSorrel >= m.needSorrel) {
    m.cooldown = .65;
    pop(m.x, m.y - 26 * state.SCALE, "Yeni yeşillik geldi");
  }
}

export function updateGreensGame(dt) {
  const m = state.mini;

  m.time -= dt;

  if (m.time <= 0) {
    return endMini();
  }

  if (m.cooldown > 0) {
    m.cooldown -= dt;

    if (m.cooldown <= 0) {
      newGreensWave(m);
    }
  }

  if (m.slow > 0) {
    m.slow -= dt;
  }

  const a = axis();
  const speed = m.speed * (m.slow > 0 ? .58 : 1);

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

  for (const leaf of m.leaves) {
    leaf.wiggle += .025;
  }

  if (state.keys.action) {
    state.keys.action = false;
    state.actionBuffer = 0;
    inspectLeaf();
  }
}

function drawLeaf(leaf) {
  const m = state.mini;
  const near = dist(m.x, m.y, leaf.x, leaf.y) < 58 * state.SCALE && !leaf.picked;

  state.ctx.save();
  state.ctx.translate(leaf.x, leaf.y + Math.sin(leaf.wiggle) * 2);

  if (leaf.picked) {
    state.ctx.globalAlpha = .28;
  }

  if (leaf.type === "greens") {
    state.ctx.fillStyle = near ? "#87db76" : "#69bd5d";

    for (let i = -1; i <= 1; i++) {
      state.ctx.beginPath();
      state.ctx.ellipse(i * 8 * state.SCALE, 0, 6 * state.SCALE, 20 * state.SCALE, i * .35, 0, Math.PI * 2);
      state.ctx.fill();
    }

    drawText("🌿", 0, 0, 18 * state.SCALE);
  } else if (leaf.type === "sorrel") {
    state.ctx.fillStyle = near ? "#9de27d" : "#7eca63";

    state.ctx.beginPath();
    state.ctx.moveTo(0, 18 * state.SCALE);
    state.ctx.bezierCurveTo(-24 * state.SCALE, -2 * state.SCALE, -10 * state.SCALE, -24 * state.SCALE, 0, -10 * state.SCALE);
    state.ctx.bezierCurveTo(10 * state.SCALE, -24 * state.SCALE, 24 * state.SCALE, -2 * state.SCALE, 0, 18 * state.SCALE);
    state.ctx.fill();

    drawText("🍃", 0, 0, 16 * state.SCALE);
  } else {
    state.ctx.fillStyle = leaf.wrong ? "#9c8a62" : near ? "#b5ca72" : "#98b45c";

    state.ctx.beginPath();
    state.ctx.ellipse(0, 0, 13 * state.SCALE, 18 * state.SCALE, .25, 0, Math.PI * 2);
    state.ctx.fill();

    drawText("☘️", 0, 0, 15 * state.SCALE);
  }

  if (near && !leaf.picked) {
    state.ctx.strokeStyle = "rgba(255,255,255,.9)";
    state.ctx.lineWidth = 3 * state.SCALE;
    state.ctx.beginPath();
    state.ctx.arc(0, 0, 28 * state.SCALE, 0, Math.PI * 2);
    state.ctx.stroke();
  }

  state.ctx.restore();
}

export function drawGreensGame() {
  const ctx = state.ctx;
  const m = state.mini;

  ctx.fillStyle = "#d8f2c7";
  ctx.fillRect(0, 0, state.W, state.H);

  drawText("Yeşillik Bahçesi", state.W / 2, 30 * state.SCALE, 22 * state.SCALE, "center", "#4f7f43", "900");

  drawText(
    `Tere: ${m.foundGreens}/${m.needGreens}  •  Kuzu kulağı: ${m.foundSorrel}/${m.needSorrel}  •  Tur ${m.wave}`,
    state.W / 2,
    54 * state.SCALE,
    12 * state.SCALE,
    "center",
    "#5f6441",
    "800"
  );

  for (const leaf of m.leaves) {
    drawLeaf(leaf);
  }

  drawTurtle(m.x, m.y, .95, "happy");

  drawText(
    `Sepete: 🌿${m.greens} 🍃${m.sorrel} ❤️${m.hearts}`,
    state.W / 2,
    state.H - 18 * state.SCALE,
    15 * state.SCALE,
    "center",
    "#4b3b2f",
    "800"
  );

  if (m.slow > 0) {
    drawText(
      "Yanlış ot kaplumbağayı bir an şaşırttı.",
      state.W / 2,
      state.H - 40 * state.SCALE,
      12 * state.SCALE,
      "center",
      "#6d5b44",
      "800"
    );
  }

  if (m.cooldown > 0) {
    wrapText(
      "Yeni yeşillikler hazırlanıyor...",
      state.W / 2,
      state.H / 2,
      state.W - 40,
      18 * state.SCALE,
      22 * state.SCALE
    );
  }
}
