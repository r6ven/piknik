import { state, dom } from "./state.js";

export function axis() {
  let x = state.joy.x + (state.keys.right ? 1 : 0) - (state.keys.left ? 1 : 0);
  let y = state.joy.y + (state.keys.down ? 1 : 0) - (state.keys.up ? 1 : 0);

  const len = Math.hypot(x, y);

  if (len > 1) {
    x /= len;
    y /= len;
  }

  return { x, y };
}

export function requestAction() {
  state.keys.action = true;
  state.actionBuffer = .18;
}

function keyName(k) {
  if (k === "ArrowUp" || k.toLowerCase() === "w") return "up";
  if (k === "ArrowDown" || k.toLowerCase() === "s") return "down";
  if (k === "ArrowLeft" || k.toLowerCase() === "a") return "left";
  if (k === "ArrowRight" || k.toLowerCase() === "d") return "right";
  if (k.toLowerCase() === "e" || k === " ") return "action";

  return null;
}

function setJoystickFromEvent(e) {
  const r = dom.joyBase.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const max = 32;

  let dx = e.clientX - cx;
  let dy = e.clientY - cy;

  const len = Math.hypot(dx, dy);

  if (len > max) {
    dx = dx / len * max;
    dy = dy / len * max;
  }

  state.joy.x = dx / max;
  state.joy.y = dy / max;

  dom.joyKnob.style.transform = `translate(${dx}px,${dy}px)`;
}

function resetJoystick() {
  state.joy.x = 0;
  state.joy.y = 0;
  state.joy.active = false;
  state.joy.pointerId = null;

  dom.joyKnob.style.transform = "translate(0,0)";
}

export function setupInput() {
  window.addEventListener("keydown", e => {
    const k = keyName(e.key);

    if (!k) return;

    e.preventDefault();

    if (k === "action") {
      requestAction();
    } else {
      state.keys[k] = true;
    }
  });

  window.addEventListener("keyup", e => {
    const k = keyName(e.key);

    if (!k) return;

    e.preventDefault();

    if (k !== "action") {
      state.keys[k] = false;
    }
  });

  dom.joyArea.addEventListener("pointerdown", e => {
    e.preventDefault();

    state.joy.active = true;
    state.joy.pointerId = e.pointerId;

    dom.joyArea.setPointerCapture(e.pointerId);
    setJoystickFromEvent(e);
  });

  dom.joyArea.addEventListener("pointermove", e => {
    if (!state.joy.active || e.pointerId !== state.joy.pointerId) return;

    e.preventDefault();
    setJoystickFromEvent(e);
  });

  dom.joyArea.addEventListener("pointerup", e => {
    if (e.pointerId === state.joy.pointerId) resetJoystick();
  });

  dom.joyArea.addEventListener("pointercancel", resetJoystick);
  dom.joyArea.addEventListener("lostpointercapture", resetJoystick);

  dom.actionBtn.addEventListener("pointerdown", e => {
    e.preventDefault();
    requestAction();
  });
}
