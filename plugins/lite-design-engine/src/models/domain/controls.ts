import { Domain, Vector3, EntityObject, mutation } from '@turbox3d/turbox3d';
import { EyeDistance } from '../../consts/scene';
import { EntityCategory } from '../../utils/category';
import { ScalePointEntity } from '../entity/scalePoint';
import { RotatePointEntity } from '../entity/rotatePoint';
import { AdjustPointEntity } from '../entity/adjustPoint';
import { DeletePointEntity } from '../entity/deletePoint';

export class Controls extends Domain {
  model: EntityObject;

  constructor(model: EntityObject) {
    super();
    this.model = model;
  }

  @mutation
  init() {
    this.initRotatePoint();
    this.initScalePoints();
    this.initAdjustPoint();
    this.initDeletePoint();
  }

  getMapRule = () => ({
    leftTop: new Vector3(-this.model.size.x / 2, this.model.size.y / 2, EyeDistance.SCALE_POINT),
    rightTop: new Vector3(this.model.size.x / 2, this.model.size.y / 2, EyeDistance.SCALE_POINT),
    rightBottom: new Vector3(this.model.size.x / 2, -this.model.size.y / 2, EyeDistance.SCALE_POINT),
    leftBottom: new Vector3(-this.model.size.x / 2, -this.model.size.y / 2, EyeDistance.SCALE_POINT),
  });

  @mutation
  initScalePoints() {
    const entities = Object.keys(this.getMapRule()).map(key => {
      const p = this.getMapRule()[key];
      const spe = new ScalePointEntity();
      spe.setName(key);
      spe.setPosition(p);
      spe.setSize({ x: spe.radius * 2, y: spe.radius * 2, z: 1 });
      return spe;
    });
    this.model.children.forEach(child => {
      if (EntityCategory.isScalePoint(child)) {
        this.model.removeChild(child);
      }
    });
    entities.forEach(e => this.model.addChild(e));
  }

  @mutation
  initRotatePoint() {
    const rotatePoint = new RotatePointEntity();
    rotatePoint.setPosition({
      x: 0,
      y: this.model.size.y / 2 + 30,
    });
    rotatePoint.setSize({ x: rotatePoint.radius * 2, y: rotatePoint.radius * 2, z: 1 });
    this.model.addChild(rotatePoint);
  }

  @mutation
  initAdjustPoint() {
    const p = this.getMapRule().rightBottom;
    const ape = new AdjustPointEntity();
    ape.setName('rightBottom');
    ape.setPosition(p);
    ape.setSize({ x: ape.radius * 2, y: ape.radius * 2, z: 1 });
    this.model.children.forEach(child => {
      if (EntityCategory.isAdjustPoint(child)) {
        this.model.removeChild(child);
      }
    });
    this.model.addChild(ape);
  }

  @mutation
  initDeletePoint() {
    const p = this.getMapRule().leftTop;
    const dpe = new DeletePointEntity();
    dpe.setName('leftTop');
    dpe.setPosition(p);
    dpe.setSize({ x: dpe.radius * 2, y: dpe.radius * 2, z: 1 });
    this.model.children.forEach(child => {
      if (EntityCategory.isDeletePoint(child)) {
        this.model.removeChild(child);
      }
    });
    this.model.addChild(dpe);
  }
}
