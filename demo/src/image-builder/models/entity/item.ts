import { computed, EntityObject, mutation, reactor, Vector2 } from '@turbox3d/turbox';
import { ItemType } from '../../common/consts/scene';
import { BLACK, GRAY, WHITE } from '../../common/consts/color';

export interface ITextStyles {
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  color: number;
  fontWeight:
    | 'normal'
    | 'bold'
    | 'bolder'
    | 'lighter'
    | '100'
    | '200'
    | '300'
    | '400'
    | '500'
    | '600'
    | '700'
    | '800'
    | '900';
  align: 'left' | 'center' | 'right' | 'justify';
  wordWrap: boolean;
  wordWrapWidth: number;
  fontStyle: 'normal' | 'italic' | 'oblique';
}

export interface IImageStyles {
  borderRadius: number;
  borderWidth: number;
  borderColor: number;
  backgroundColor: number;
  transparent: boolean;
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
    borderRadius: 0,
    borderWidth: 0,
    borderColor: GRAY,
    backgroundColor: WHITE,
    transparent: true,
  };
  /** 当前操作 entity 中的文字实时包围盒 */
  @reactor(true, false) textBounds = { width: 0, height: 0 };

  @mutation
  setTextBounds(bounds: Partial<{ width: number; height: number }>) {
    bounds.width && (this.textBounds.width = bounds.width);
    bounds.height && (this.textBounds.height = bounds.height);
  }

  @computed({ lazy: false })
  get fontStyles() {
    return {
      fontSize: this.attribute.fontSize,
      lineHeight: this.attribute.lineHeight * this.attribute.fontSize,
      fontFamily: this.attribute.fontFamily,
      fill: this.attribute.color,
      fontWeight: this.attribute.fontWeight,
      align: this.attribute.align,
      wordWrap: this.attribute.wordWrap,
      wordWrapWidth: this.attribute.wordWrapWidth,
      fontStyle: this.attribute.fontStyle,
    };
  }
}
