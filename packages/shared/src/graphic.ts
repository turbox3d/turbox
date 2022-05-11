export interface Vec2 {
  x: number;
  y: number;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/** 判断点是否在矩形内 */
export function pointInRect(p: Vec2, rect: Vec2[]) {
  const [r1, r2] = rect;
  const c1 = (p.x - r1.x) * (p.x - r2.x);
  const c2 = (p.y - r1.y) * (p.y - r2.y);
  return c1 <= 0 && c2 <= 0;
}

/**
 * 获得点击位置相对于 canvas 的坐标
 * 如果输入参数不合法，或点击位置超出 canvas 的 clientRect 则返回 undefined
 * @param vec 事件坐标
 * @param canvas 要接受的 canvas 对象
 */
export function getRelativePositionFromEvent(vec: Vec2, canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  const point = {
    x: vec.x - rect.left,
    y: vec.y - rect.top,
  };
  if (point.x <= 0 || point.y <= 0 || point.x > rect.width || point.y > rect.height) {
    return undefined;
  }
  return point;
}
