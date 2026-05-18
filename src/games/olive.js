import { state } from "../state.js";
import { drawText } from "../draw.js";
import { endMini } from "../main.js";

export function createOliveGame() {
  return {
    id: "olive",
    time: 5,
    green: 0,
    black: 0
  };
}

export function updateOliveGame(dt) {
  state.mini.time -= dt;

  if (state.mini.time <= 0) {
    endMini();
  }
}

export function drawOliveGame() {
  state.ctx.fillStyle = "#e6e6b8";
  state.ctx.fillRect(0, 0, state.W, state.H);

  drawText("Zeytin oyunu modül olarak çalışıyor 🫒", state.W / 2, state.H / 2, 20 * state.SCALE);
}
