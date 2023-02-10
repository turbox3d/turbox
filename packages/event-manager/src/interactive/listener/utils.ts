import { Vec2 } from '@turbox3d/shared';
import { NativeEventSet } from '../type';

export function isMouseMoved(mouseDownInfo: Vec2, moveEvent: NativeEventSet, tolerance: number) {
  const dx = mouseDownInfo.x - moveEvent.clientX;
  const dy = mouseDownInfo.y - moveEvent.clientY;
  return dx * dx + dy * dy > tolerance * tolerance;
}
