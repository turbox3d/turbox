export function isMouseMoved(downEvent: MouseEvent, moveEvent: MouseEvent, tolerance: number) {
  const dx = downEvent.screenX - moveEvent.screenX;
  const dy = downEvent.screenY - moveEvent.screenY;
  return dx * dx + dy * dy > tolerance * tolerance;
}
