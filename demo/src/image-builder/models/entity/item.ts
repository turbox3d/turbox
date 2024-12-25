import { EntityObject, mutation, reactor, Vector2 } from '@turbox3d/turbox';
import { ItemType } from '../../common/consts/scene';

export class ItemEntity extends EntityObject {
  @reactor imageData?: HTMLImageElement;
  @reactor resourceUrl = '';
  @reactor materialDirection = new Vector2(1, 1);
  @reactor snapped = false;
  @reactor itemType = ItemType.IMAGE;
  @reactor text = '';
  @reactor fontSize = 30;

  @mutation
  setMaterialDirection(v: Vector2) {
    this.materialDirection.x = v.x;
    this.materialDirection.y = v.y;
  }
}
