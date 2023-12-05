import { EntityObject, reactor } from '@turbox3d/turbox';

export class FrameEntity extends EntityObject {
  @reactor imageData?: HTMLImageElement;
  @reactor resourceUrl = '';
  @reactor bgColor = 0xffffff;
}
