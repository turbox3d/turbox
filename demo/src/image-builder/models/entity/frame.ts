import { EntityObject, reactor } from '@turbox3d/turbox';
import { WHITE } from '../../common/consts/color';

export class FrameEntity extends EntityObject {
  @reactor imageData?: HTMLImageElement;
  @reactor resourceUrl = '';
  @reactor bgColor = WHITE;
}
