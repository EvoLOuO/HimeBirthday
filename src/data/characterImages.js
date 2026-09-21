export const characterImages = {
  default: "/avatar.png",
  like: "/character/character-like.png",
  gift: "/character/character-gift.png",
  surprised: "/character/character-surprised.png",
  birthday: "/character/character-birthday.png",
};
// Only public/avatar.png is needed. Expression images are optional enhancements.
// Optional images load in the background; avatar.png stays visible until ready.
export const characterStyle = {
  width: "min(380px, 100%)",
  height: "min(420px, 54%)",
  left: "50%",
  top: "auto",
  bottom: "27%",
  marginLeft: "0px",
  translate: "-50% 0",
};

// Lightweight motion for a single image; no Live2D model or extra artwork needed.
export const characterMotion = {
  enabled: true,
  followPointer: true,
  pointerTravelPx: 7,
  pointerTiltDeg: 2,
  swayDeg: 2,
  floatPx: 8,
  breathScale: 1.025,
  breathMs: 3200,
  swayMs: 4800,
};
