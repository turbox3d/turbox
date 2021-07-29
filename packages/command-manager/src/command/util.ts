import { BaseCommandBox } from './BaseCommandBox';

export function isCommandBox(box: any): box is BaseCommandBox {
  return box instanceof BaseCommandBox;
}
