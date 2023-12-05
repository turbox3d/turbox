import { EntityObject, mutation, reactor, Vector2 } from '@byted-tx3d/turbox';

export class ItemEntity extends EntityObject {
  @reactor imageData?: HTMLImageElement;
  @reactor resourceUrl = '';
  @reactor materialDirection = new Vector2(1, 1);
  @reactor snapped = false;

  @mutation
  setMaterialDirection(v: Vector2) {
    this.materialDirection.x = v.x;
    this.materialDirection.y = v.y;
  }
}
