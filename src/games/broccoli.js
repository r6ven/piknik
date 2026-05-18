import { state } from "../state.js";
import { drawText } from "../draw.js";
import { endMini } from "../main.js";

export function createBroccoliGame() {
  return {
    id: "broccoli",
    time: 5,
    score: 0
  };
}

export function updateBroccoliGame(dt) {
  state.mini.time -= dt;

  if (state.mini.time <= 0) {
    endMini();
  }
}

export function drawBroccoliGame() {
  state.ctx.fillStyle = "#c9edc2";
  state.ctx.fillRect(0, 0, state.W, state.H);

  drawText("Brokoli oyunu modül olarak çalışıyor 🥦", state.W / 2, state.H / 2, 20 * state.SCALE);
}
