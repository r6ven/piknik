export const state = {
  canvas: null,
  ctx: null,

  W: 390,
  H: 700,
  SCALE: 1,

  scene: "menu",
  last: performance.now(),

  msgTimer: 0,
  actionBuffer: 0,

  nearStation: null,
  mini: null,
  particles: [],

  keys: {
    up: false,
    down: false,
    left: false,
    right: false,
    action: false
  },

  joy: {
    x: 0,
    y: 0,
    active: false,
    pointerId: null
  },

  basket: {
    strawberry: 0,
    lemon: 0,
    plum: 0,
    greens: 0,
    sorrel: 0,
    greenOlive: 0,
    blackOlive: 0,
    broccoli: 0,
    heart: 0
  },

  played: {
    strawberry: false,
    lemon: false,
    plum: false,
    greens: false,
    olive: false,
    broccoli: false
  },

  turtle: {
    x: 195,
    y: 469,
    r: 23,
    face: 1,
    bob: 0
  },

  stations: [
    {
      id: "strawberry",
      label: "Çilek Tarlası",
      emoji: "🍓",
      rx: .18,
      ry: .22,
      color: "#ff8ca4",
      desc: "Parlayan çalıları hatırla."
    },
    {
      id: "lemon",
      label: "Limon Ağacı",
      emoji: "🍋",
      rx: .50,
      ry: .18,
      color: "#ffd861",
      desc: "Dallardan düşen limonları yakala."
    },
    {
      id: "plum",
      label: "Erik Labirenti",
      emoji: "🟣",
      rx: .82,
      ry: .23,
      color: "#b790ff",
      desc: "Erikleri topla, engellerden kaç."
    },
    {
      id: "greens",
      label: "Yeşillik Bahçesi",
      emoji: "🌿",
      rx: .22,
      ry: .53,
      color: "#8edb78",
      desc: "Tere ve kuzu kulağını ayırt et."
    },
    {
      id: "olive",
      label: "Zeytinlik",
      emoji: "🫒",
      rx: .78,
      ry: .54,
      color: "#a9bd5f",
      desc: "Siyah ve yeşil zeytini ayıkla."
    },
    {
      id: "broccoli",
      label: "Brokoli Bostanı",
      emoji: "🥦",
      rx: .30,
      ry: .78,
      color: "#75c96a",
      desc: "Tam olgunlaşınca hasat et."
    },
    {
      id: "final",
      label: "Piknik Alanı",
      emoji: "❤️",
      rx: .68,
      ry: .78,
      color: "#ffb2bf",
      desc: "Sepeti açıp final pikniğine git."
    }
  ]
};

export const dom = {
  overlay: null,
  startGameBtn: null,
  modePill: null,
  basketPill: null,
  timePill: null,
  messageBox: null,
  actionBtn: null,
  restartBtn: null,
  joyArea: null,
  joyBase: null,
  joyKnob: null
};
