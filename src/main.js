import { state, dom } from "./state.js";
import { setupInput, axis } from "./input.js";
import {
  clamp,
  dist,
  stationX,
  stationY,
  moveSpeed,
  drawBackground,
  drawText,
  drawRoundedRect,
  wrapText,
  drawTurtle
} from "./draw.js";

import { createStrawberryGame, updateStrawberryGame, drawStrawberryGame } from "./games/strawberry.js";
import { createLemonGame, updateLemonGame, drawLemonGame } from "./games/lemon.js";
import { createPlumGame, updatePlumGame, drawPlumGame } from "./games/plum.js";
import { createGreensGame, updateGreensGame, drawGreensGame } from "./games/greens.js";
import { createOliveGame, updateOliveGame, drawOliveGame } from "./games/olive.js";
import { createBroccoliGame, updateBroccoliGame, drawBroccoliGame } from "./games/broccoli.js";

function initDom() {
  state.canvas = document.getElementById("game");
  state.ctx = state.canvas.getContext("2d");

  dom.overlay = document.getElementById("overlay");
  dom.startGameBtn = document.getElementById("startGame");
  dom.modePill = document.getElementById("modePill");
  dom.basketPill = document.getElementById("basketPill");
  dom.timePill = document.getElementById("timePill");
  dom.messageBox = document.getElementById("message");
  dom.actionBtn = document.getElementById("actionBtn");
  dom.restartBtn = document.getElementById("restartBtn");
  dom.joyArea = document.getElementById("joyArea");
  dom.joyBase = document.getElementById("joyBase");
  dom.joyKnob = document.getElementById("joyKnob");
}

function resizeCanvas() {
  const rect = state.canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  state.W = Math.max(280, Math.floor(rect.width));
  state.H = Math.max(420, Math.floor(rect.height));

  state.canvas.width = Math.floor(state.W * dpr);
  state.canvas.height = Math.floor(state.H * dpr);

  state.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  state.SCALE = clamp(state.W / 430, .72, 1.05);

  state.turtle.x = clamp(state.turtle.x || state.W * .5, 42, state.W - 42);
  state.turtle.y = clamp(state.turtle.y || state.H * .67, 70, state.H - 42);
}

function showMessage(text, seconds = 3) {
  dom.messageBox.textContent = text;
  dom.messageBox.classList.add("show");
  state.msgTimer = seconds;
}

export function pop(x, y, text) {
  state.particles.push({
    x,
    y,
    text,
    life: 1,
    vy: -48,
    size: 22 * state.SCALE
  });
}

function basketTotal() {
  const b = state.basket;

  return b.strawberry +
    b.lemon +
    b.plum +
    b.greens +
    b.sorrel +
    b.greenOlive +
    b.blackOlive +
    b.broccoli;
}

function updateHud() {
  const total = basketTotal();

  dom.basketPill.textContent = `Sepet: ${total} parça ❤️${state.basket.heart}`;

  if (state.scene === "map") {
    dom.modePill.textContent = "🐢 Bahçe";
    dom.timePill.textContent = total >= 30 ? "Piknik hazır" : `${total}/30`;
    dom.actionBtn.textContent = state.nearStation
      ? state.nearStation.id === "final"
        ? "PİKNİK"
        : "BAŞLA"
      : "BAŞLA";
  } else if (state.mini) {
    dom.timePill.textContent = `${Math.ceil(state.mini.time)} sn`;
    dom.actionBtn.textContent = ["strawberry", "greens", "broccoli"].includes(state.scene)
      ? "TOPLA"
      : "BAŞLA";
  } else if (state.scene === "final") {
    dom.modePill.textContent = "❤️ Piknik";
    dom.timePill.textContent = "Mutlu son";
    dom.actionBtn.textContent = "DÖN";
  } else {
    dom.timePill.textContent = "Süre: -";
    dom.actionBtn.textContent = "BAŞLA";
  }
}

function startMini(id) {
  if (id === "strawberry") {
    state.scene = "strawberry";
    dom.modePill.textContent = "🍓 Çilek";
    state.mini = createStrawberryGame();
    showMessage("Parlayan çalıları ezberle. Toplamak için TOPLA tuşuna bas.", 3);
  }

  if (id === "lemon") {
    state.scene = "lemon";
    dom.modePill.textContent = "🍋 Limon";
    state.mini = createLemonGame();
    showMessage("Dallardan düşen limonları yakala, çürüklerden kaç.", 3);
  }

  if (id === "plum") {
    state.scene = "plum";
    dom.modePill.textContent = "🟣 Erik";
    state.mini = createPlumGame();
    showMessage("Erikleri topla. Salyangozlar gittikçe hızlanır.", 3);
  }

  if (id === "greens") {
    state.scene = "greens";
    dom.modePill.textContent = "🌿 Yeşillik";
    state.mini = createGreensGame();
    showMessage("Tere ve kuzu kulağını doğru ayırt et.", 3);
  }

  if (id === "olive") {
    state.scene = "olive";
    dom.modePill.textContent = "🫒 Zeytinlik";
    state.mini = createOliveGame();
    showMessage("Yeşil ve siyah zeytinleri doğru tarafa ayır.", 3);
  }

  if (id === "broccoli") {
    state.scene = "broccoli";
    dom.modePill.textContent = "🥦 Brokoli";
    state.mini = createBroccoliGame();
    showMessage("Brokoliyi tam olgunlaşınca topla.", 3);
  }
}

export function endMini() {
  const m = state.mini;
  if (!m) return;

  const b = state.basket;

  if (m.id === "strawberry") {
    b.strawberry += m.score;
    b.heart += m.hearts + Math.floor(m.score / 8);
    state.played.strawberry = true;
    showMessage(`${m.score} çilek ve ${m.hearts} kalp çileği sepete girdi.`, 4);
  }

  if (m.id === "lemon") {
    b.lemon += m.score;
    b.heart += Math.floor(m.score / 10);
    state.played.lemon = true;
    showMessage(`${m.score} limon sepete girdi.`, 4);
  }

  if (m.id === "plum") {
    b.plum += m.score;
    b.heart += Math.floor(m.score / 7);
    state.played.plum = true;
    showMessage(`${m.score} erik toplandı.`, 4);
  }

  if (m.id === "greens") {
    b.greens += m.greens;
    b.sorrel += m.sorrel;
    b.heart += m.hearts;
    state.played.greens = true;
    showMessage(`${m.greens} tere, ${m.sorrel} kuzu kulağı sepete girdi.`, 4);
  }

  if (m.id === "olive") {
    b.greenOlive += m.green;
    b.blackOlive += m.black;
    state.played.olive = true;
    showMessage(`${m.green} yeşil, ${m.black} siyah zeytin ayrıldı.`, 4);
  }

  if (m.id === "broccoli") {
    b.broccoli += m.score;
    b.heart += Math.floor(m.score / 6);
    state.played.broccoli = true;
    showMessage(`${m.score} brokoli tam kıvamında toplandı.`, 4);
  }

  state.scene = "map";
  state.mini = null;

  state.turtle.x = state.W * .5;
  state.turtle.y = state.H * .67;
}

function updateMap(dt) {
  const a = axis();
  const turtle = state.turtle;

  if (a.x || a.y) {
    turtle.x += a.x * moveSpeed() * dt;
    turtle.y += a.y * moveSpeed() * dt;

    if (Math.abs(a.x) > .1) {
      turtle.face = a.x > 0 ? 1 : -1;
    }
  }

  turtle.x = clamp(turtle.x, 38 * state.SCALE, state.W - 38 * state.SCALE);
  turtle.y = clamp(turtle.y, 48 * state.SCALE, state.H - 38 * state.SCALE);
  turtle.bob += (a.x || a.y ? 10 : 4) * dt;

  state.nearStation = null;

  for (const st of state.stations) {
    if (dist(turtle.x, turtle.y, stationX(st), stationY(st)) < 70 * state.SCALE) {
      state.nearStation = st;
    }
  }

  if (state.keys.action && state.nearStation) {
    state.keys.action = false;
    state.actionBuffer = 0;

    if (state.nearStation.id === "final") {
      startFinal();
    } else {
      startMini(state.nearStation.id);
    }
  }
}

function drawStation(st) {
  const ctx = state.ctx;
  const x = stationX(st);
  const y = stationY(st);
  const isNear = state.nearStation && state.nearStation.id === st.id;
  const done = state.played[st.id];

  const outer = (isNear ? 58 : 50) * state.SCALE;
  const inner = 32 * state.SCALE;

  ctx.save();
  ctx.globalAlpha = st.id === "final" && basketTotal() < 6 ? .62 : 1;

  ctx.fillStyle = isNear ? "rgba(255,255,255,.75)" : "rgba(255,255,255,.48)";
  ctx.strokeStyle = isNear ? "#fff" : "rgba(255,255,255,.55)";
  ctx.lineWidth = 4 * state.SCALE;

  ctx.beginPath();
  ctx.arc(x, y, outer, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = st.color;
  ctx.beginPath();
  ctx.arc(x, y, inner, 0, Math.PI * 2);
  ctx.fill();

  drawText(st.emoji, x, y - 2 * state.SCALE, 30 * state.SCALE);
  drawText(done ? `${st.label} ✓` : st.label, x, y + 52 * state.SCALE, 13 * state.SCALE, "center", "#4b3b2f", "800");

  if (isNear) {
    drawText(
      st.id === "final" ? "Pikniğe git" : "Mini oyuna başla",
      x,
      y + 72 * state.SCALE,
      12 * state.SCALE,
      "center",
      "#6d5b44",
      "700"
    );
  }

  ctx.restore();
}

function drawMap() {
  drawBackground();

  const ctx = state.ctx;

  for (let i = 0; i < 36; i++) {
    const x = (i * 73 + 45) % state.W;
    const y = (i * 129 + 93) % state.H;

    ctx.fillStyle = i % 2 ? "rgba(255,168,184,.35)" : "rgba(255,255,255,.35)";

    ctx.beginPath();
    ctx.arc(x, y, (3 + (i % 3)) * state.SCALE, 0, Math.PI * 2);
    ctx.fill();
  }

  state.stations.forEach(drawStation);
  drawTurtle(state.turtle.x, state.turtle.y);

  if (state.nearStation) {
    const pw = Math.min(state.W - 28, 500 * state.SCALE);

    ctx.save();
    drawRoundedRect(state.W / 2 - pw / 2, state.H - 62 * state.SCALE, pw, 44 * state.SCALE, 18 * state.SCALE);
    ctx.fillStyle = "rgba(255,255,255,.66)";
    ctx.fill();

    wrapText(
      `${state.nearStation.emoji} ${state.nearStation.desc}`,
      state.W / 2,
      state.H - 40 * state.SCALE,
      pw - 18 * state.SCALE,
      12.5 * state.SCALE,
      14 * state.SCALE
    );

    ctx.restore();
  }
}

function startFinal() {
  state.scene = "final";
  state.mini = null;
  state.nearStation = null;

  showMessage("Sepet açılıyor. Kaplumbağa final pikniğine geldi.", 4);
}

function finalText() {
  const b = state.basket;

  if (b.heart >= 8) return "Kaplumbağa bugün sadece yiyecek değil, küçük küçük sevgi de toplamış.";
  if (b.greens + b.sorrel >= 8) return "Yeşillikler sofraya bahçe kokusu getirdi.";
  if (b.greenOlive + b.blackOlive >= 8) return "Zeytin tabağı hazır. Minik piknik ciddileşti.";
  if (b.broccoli >= 6) return "Brokoli bile bu sofrada sevimli durmayı başardı.";
  if (basketTotal() >= 40) return "Sepette her şeyden biraz var. Güzel şeyler tek tatla olmaz.";

  return "Sepet küçük olabilir ama kaplumbağanın niyeti kocaman.";
}

function drawFinal() {
  const ctx = state.ctx;
  const { W, H, SCALE } = state;

  const g = ctx.createRadialGradient(W / 2, H / 2, 30, W / 2, H / 2, Math.max(W, H));
  g.addColorStop(0, "#fff7df");
  g.addColorStop(1, "#cfeec5");

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  drawText("Piknik Sepeti Açıldı", W / 2, 48 * SCALE, 26 * SCALE, "center", "#4f7f43", "900");

  const cw = Math.min(W * .82, 420 * SCALE);
  const ch = Math.min(H * .26, 190 * SCALE);

  ctx.save();
  ctx.translate(W / 2, H / 2 + 10 * SCALE);
  ctx.rotate(Math.sin(performance.now() / 800) * .015);

  ctx.fillStyle = "#ff9fb1";
  drawRoundedRect(-cw / 2, -ch / 2, cw, ch, 24 * SCALE);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,.55)";
  ctx.lineWidth = 7 * SCALE;

  ctx.beginPath();
  ctx.moveTo(-cw / 2, 0);
  ctx.lineTo(cw / 2, 0);
  ctx.moveTo(0, -ch / 2);
  ctx.lineTo(0, ch / 2);
  ctx.stroke();

  const foods = [];
  const b = state.basket;

  for (let i = 0; i < Math.min(b.strawberry, 7); i++) foods.push("🍓");
  for (let i = 0; i < Math.min(b.lemon, 7); i++) foods.push("🍋");
  for (let i = 0; i < Math.min(b.plum, 7); i++) foods.push("🟣");
  for (let i = 0; i < Math.min(b.greens, 5); i++) foods.push("🌿");
  for (let i = 0; i < Math.min(b.sorrel, 5); i++) foods.push("🍃");
  for (let i = 0; i < Math.min(b.greenOlive + b.blackOlive, 7); i++) foods.push("🫒");
  for (let i = 0; i < Math.min(b.broccoli, 6); i++) foods.push("🥦");
  for (let i = 0; i < Math.min(b.heart, 6); i++) foods.push("❤️");

  if (!foods.length) foods.push("🐢");

  foods.forEach((f, i) => {
    const cols = Math.max(4, Math.floor(cw / (46 * SCALE)));
    const x = -cw * .36 + (i % cols) * 42 * SCALE;
    const y = -ch * .25 + Math.floor(i / cols) * 38 * SCALE;

    drawText(f, x, y, 26 * SCALE);
  });

  ctx.restore();

  drawTurtle(W * .22, H * .72, 1.05, "happy");

  const bw = Math.min(W - 28, 720 * SCALE);

  ctx.fillStyle = "rgba(255,255,255,.72)";
  drawRoundedRect(W / 2 - bw / 2, H - 112 * SCALE, bw, 78 * SCALE, 24 * SCALE);
  ctx.fill();

  wrapText(finalText(), W / 2, H - 84 * SCALE, bw - 24 * SCALE, 17 * SCALE, 19 * SCALE);

  drawText("Haritaya dönmek için BAŞLA.", W / 2, H - 45 * SCALE, 12.5 * SCALE, "center", "#6d5b44", "700");

  if (state.keys.action) {
    state.keys.action = false;
    state.actionBuffer = 0;
    state.scene = "map";
    showMessage("Bahçeye geri döndün. Sepeti büyütmek serbest.", 3);
  }
}

function restartCurrent() {
  if (["strawberry", "lemon", "plum", "greens", "olive", "broccoli"].includes(state.scene)) {
    const id = state.scene;
    startMini(id);
    showMessage("Mini oyun yeniden başladı.", 2);
    return;
  }

  Object.keys(state.basket).forEach(k => {
    state.basket[k] = 0;
  });

  Object.keys(state.played).forEach(k => {
    state.played[k] = false;
  });

  state.scene = "map";
  state.mini = null;
  state.turtle.x = state.W * .5;
  state.turtle.y = state.H * .67;

  showMessage("Test reseti: sepet boşaldı, bahçeye döndün.", 3);
}

function updateParticles(dt) {
  for (const p of state.particles) {
    p.life -= dt;
    p.y += p.vy * dt;
  }

  state.particles = state.particles.filter(p => p.life > 0);
}

function drawParticles() {
  for (const p of state.particles) {
    state.ctx.save();
    state.ctx.globalAlpha = Math.max(0, p.life);
    drawText(p.text, p.x, p.y, p.size, "center", "#4b3b2f", "900");
    state.ctx.restore();
  }
}

function update(dt) {
  if (state.actionBuffer > 0) {
    state.actionBuffer -= dt;

    if (state.actionBuffer <= 0) {
      state.keys.action = false;
    }
  }

  if (state.msgTimer > 0) {
    state.msgTimer -= dt;

    if (state.msgTimer <= 0) {
      dom.messageBox.classList.remove("show");
    }
  }

  if (state.scene === "map") updateMap(dt);
  if (state.scene === "strawberry") updateStrawberryGame(dt);
  if (state.scene === "lemon") updateLemonGame(dt);
  if (state.scene === "plum") updatePlumGame(dt);
  if (state.scene === "greens") updateGreensGame(dt);
  if (state.scene === "olive") updateOliveGame(dt);
  if (state.scene === "broccoli") updateBroccoliGame(dt);

  updateParticles(dt);
  updateHud();
}

function draw() {
  if (state.scene === "menu") drawBackground();
  if (state.scene === "map") drawMap();
  if (state.scene === "strawberry") drawStrawberryGame();
  if (state.scene === "lemon") drawLemonGame();
  if (state.scene === "plum") drawPlumGame();
  if (state.scene === "greens") drawGreensGame();
  if (state.scene === "olive") drawOliveGame();
  if (state.scene === "broccoli") drawBroccoliGame();
  if (state.scene === "final") drawFinal();

  drawParticles();
}

function loop(now) {
  const dt = Math.min(.033, (now - state.last) / 1000);

  state.last = now;

  update(dt);
  draw();

  requestAnimationFrame(loop);
}

function boot() {
  initDom();
  resizeCanvas();
  setupInput();

  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("orientationchange", () => setTimeout(resizeCanvas, 250));

  dom.restartBtn.addEventListener("click", restartCurrent);

  dom.startGameBtn.addEventListener("click", () => {
    dom.overlay.classList.add("hidden");

    resizeCanvas();

    state.turtle.x = state.W * .5;
    state.turtle.y = state.H * .67;

    state.scene = "map";

    showMessage("Bahçeye hoş geldin. Bir alana yaklaş ve BAŞLA ile mini oyuna gir.", 4);
  });

  requestAnimationFrame(loop);
}

boot();
