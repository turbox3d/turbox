import { EntityObject, mutation, reactor, Vector2, Vector3 } from '@turbox3d/turbox';
import { ScalePointEntity } from './scalePoint';
import { RotatePointEntity } from './rotatePoint';
import { AdjustPointEntity } from './adjustPoint';
import { DeletePointEntity } from './deletePoint';

export class ProductEntity<CustomBizData = any> extends EntityObject {
  /** 当前贴图 */
  @reactor url = '';
  @reactor urlImage: HTMLImageElement;
  /** 形变用的原始贴图（形变之前的，如果被裁剪过，skewOriginalUrl 也会被更新）*/
  @reactor skewOriginalUrl = '';
  @reactor skewOriginalUrlImage: HTMLImageElement;
  /** 抠图前的贴图 */
  @reactor cutoutOriginalUrl = '';
  /** 抠图后的贴图 */
  @reactor cutoutUrl = '';
  /** 最初的素材图片（完全没被处理过的）*/
  @reactor resourceUrl = '';
  /** 是否形变过 */
  @reactor isSkewed = false;
  /** 是否裁剪过 */
  @reactor isClipped = false;
  @reactor materialDirection = new Vector2(1, 1);
  @reactor snapped = false;

  /** 额外的业务自定义数据 */
  @reactor extraInfo: CustomBizData = {} as CustomBizData;
  // cropPercent = '';

  constructor(id?: string) {
    super(id);
  }

  getMapRule = (size = this.size) => ({
    leftTop: new Vector3(-size.x / 2, size.y / 2, 0),
    rightTop: new Vector3(size.x / 2, size.y / 2, 0),
    rightBottom: new Vector3(size.x / 2, -size.y / 2, 0),
    leftBottom: new Vector3(-size.x / 2, -size.y / 2, 0),
  });

  @mutation
  setMaterialDirection(v: Vector2) {
    this.materialDirection.x = v.x;
    this.materialDirection.y = v.y;
  }

  @mutation
  updateControlPoints() {
    this.children.forEach(child => {
      if (child instanceof ScalePointEntity) {
        child.setPosition(this.getMapRule()[child.name]);
      }
      if (child instanceof RotatePointEntity) {
        child.setPosition({
          x: 0,
          y: this.size.y / 2 + 30,
        });
      }
      if (child instanceof AdjustPointEntity) {
        child.setPosition(this.getMapRule().rightBottom);
      }
      if (child instanceof DeletePointEntity) {
        child.setPosition(this.getMapRule().leftTop);
      }
    });
  }
  // reactivePipeLine = [{
  //   func: () => {
  //     this.updateScalePoints();
  //   },
  //   options: {
  //     deps: [
  //       () => this.size,
  //     ],
  //   },
  // }];

  // constructor() {
  //   super();
  //   this.runReactivePipeLine();
  // }
}
