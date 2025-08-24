import kaplay from "kaplay";

const k = kaplay({
  width: 256,
  height: 224,
  letterbox: true,
  touchToMouse: true,
  scale: 2,
  pixelDensity: 1,
  debug: false,
  background: [0, 0, 0],
  crisp: true,
});

export default k;
