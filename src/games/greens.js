import { state } from "../state.js";
import { drawText } from "../draw.js";
import { endMini } from "../main.js";

export function createGreensGame() {
  return {
    id: "greens",
    time: 5,
    greens: 0,
    sorrel: 0,
    hearts: 0
  };
}

export function updateGreensGame(dt) {
  state.mini.time -= dt;

  if (state.mini.time <= 0) {
    endMini();
  }
}

export function drawGreensGame() {
  state.ctx.fillStyle = "#d8f2c7";
  state.ctx.fillRect(0, 0, state.W, state.H);

  drawText("Yeşillik oyunu modül olarak çalışıyor 🌿", state.W / 2, state.H / 2, 20 * state.SCALE);
}
