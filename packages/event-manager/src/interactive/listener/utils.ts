import { Vec2 } from '@turbox3d/shared';

export const MoveTolerance = 4;

export function isMouseMoved(mouseDownInfo: Vec2, moveEvent: PointerEvent | Touch, tolerance: number) {
  const dx = mouseDownInfo.x - moveEvent.clientX;
  const dy = mouseDownInfo.y - moveEvent.clientY;
  return dx * dx + dy * dy > tolerance * tolerance;
}
