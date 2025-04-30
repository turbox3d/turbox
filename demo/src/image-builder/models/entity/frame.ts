import { EntityObject, reactor } from '@turbox3d/turbox';
import { GRAY } from '../../common/consts/color';

export class FrameEntity extends EntityObject {
  @reactor imageData?: HTMLImageElement;
  @reactor resourceUrl = '';
  @reactor bgColor = GRAY;
}
