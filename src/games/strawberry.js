import { state } from "../state.js";
import { drawText } from "../draw.js";
import { endMini } from "../main.js";

export function createStrawberryGame() {
  return {
    id: "strawberry",
    time: 5,
    score: 0,
    hearts: 0
  };
}

export function updateStrawberryGame(dt) {
  state.mini.time -= dt;

  if (state.mini.time <= 0) {
    endMini();
  }
}

export function drawStrawberryGame() {
  state.ctx.fillStyle = "#cdefbc";
  state.ctx.fillRect(0, 0, state.W, state.H);

  drawText("Çilek oyunu modül olarak çalışıyor 🍓", state.W / 2, state.H / 2, 20 * state.SCALE);
}
