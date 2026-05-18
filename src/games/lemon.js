import { state } from "../state.js";
import { drawText } from "../draw.js";
import { endMini } from "../main.js";

export function createLemonGame() {
  return {
    id: "lemon",
    time: 5,
    score: 0
  };
}

export function updateLemonGame(dt) {
  state.mini.time -= dt;

  if (state.mini.time <= 0) {
    endMini();
  }
}

export function drawLemonGame() {
  state.ctx.fillStyle = "#cceebb";
  state.ctx.fillRect(0, 0, state.W, state.H);

  drawText("Limon oyunu modül olarak çalışıyor 🍋", state.W / 2, state.H / 2, 20 * state.SCALE);
}
