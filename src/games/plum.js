import { state } from "../state.js";
import { drawText } from "../draw.js";
import { endMini } from "../main.js";

export function createPlumGame() {
  return {
    id: "plum",
    time: 5,
    score: 0
  };
}

export function updatePlumGame(dt) {
  state.mini.time -= dt;

  if (state.mini.time <= 0) {
    endMini();
  }
}

export function drawPlumGame() {
  state.ctx.fillStyle = "#e8dbff";
  state.ctx.fillRect(0, 0, state.W, state.H);

  drawText("Erik oyunu modül olarak çalışıyor 🟣", state.W / 2, state.H / 2, 20 * state.SCALE);
}
