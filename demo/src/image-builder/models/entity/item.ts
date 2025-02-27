import { EntityObject, mutation, reactor, Vector2 } from '@turbox3d/turbox';
import { ItemType } from '../../common/consts/scene';
import { BLACK, GRAY, WHITE } from '../../common/consts/color';

export interface ITextStyles {
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  color: number;
  fontWeight: 'normal'|'bold'|'bolder'|'lighter'|'100'|'200'|'300'|'400'|'500'|'600'|'700'|'800'|'900';
  align: 'left'|'center'|'right'|'justify';
  wordWrap: boolean;
  wordWrapWidth: number;
}

export interface IImageStyles {
  borderRadius: number;
  borderWidth: number;
  borderColor: number;
  backgroundColor: number;
}

export class ItemEntity extends EntityObject {
  @reactor imageData?: HTMLImageElement;
  @reactor resourceUrl = '';
  @reactor materialDirection = new Vector2(1, 1);
  @reactor snapped = false;
  @reactor itemType = ItemType.IMAGE;
  @reactor text = '';
  @reactor href = '';
  @reactor attribute: ITextStyles & IImageStyles & Record<string, any> = {
    fontSize: 30,
    lineHeight: 1.5,
    fontFamily: 'Arial',
    color: BLACK,
    fontWeight: 'normal',
    align: 'left',
    wordWrap: true,
    wordWrapWidth: 375,
    fontStyle: 'normal',
    borderWidth: 0,
    borderColor: GRAY,
    backgroundColor: WHITE,
    borderRadius: 0,
  };

  @mutation
  setMaterialDirection(v: Vector2) {
    this.materialDirection.x = v.x;
    this.materialDirection.y = v.y;
  }
}
