function randomColor() {
  let c = Math.floor(Math.random() * 256);
  while (c === 0 || c > 255) {
    c = Math.floor(Math.random() * 256);
  }
  return c;
}
function prefix(num: number, val: string) {
  return (new Array(num).join('0') + val).slice(-num);
}
export function color16() {
  const r = randomColor().toString(16);
  const g = randomColor().toString(16);
  const b = randomColor().toString(16);
  const color = `#${prefix(2, r)}${prefix(2, g)}${prefix(2, b)}`;
  return color;
}
