import { Vec2 } from '@turbox3d/shared';

export function isMouseMoved(mouseDownInfo: Vec2, moveEvent: PointerEvent | Touch, tolerance: number) {
  const dx = mouseDownInfo.x - moveEvent.screenX;
  const dy = mouseDownInfo.y - moveEvent.screenY;
  return dx * dx + dy * dy > tolerance * tolerance;
}
