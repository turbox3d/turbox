import { EntityObject, Mesh3D, Vector3, Vec3, Mesh2D, DrawUtils } from '@turbox3d/turbox3d';
import * as THREE from 'three';
import * as PIXI from 'pixi.js';
import { color16 } from '../../../utils/color';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry';
import { Wireframe } from 'three/examples/jsm/lines/Wireframe';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { ProductEntity } from '../../..';
import { ClipPointEntity } from '../../../models/entity/clipPoint';
import { Shape, ShapeBufferGeometry } from 'three';
import { ldeStore } from '../../../models/index';

export class Grid extends Mesh3D {
  protected view = new THREE.GridHelper(5000, 50, 0x444444, 0x444444);
}

export class Axes extends Mesh3D {
  protected view = new THREE.AxesHelper(5000);
}
interface IProps {
  model: EntityObject;
}

export class WireFrame extends Mesh3D<IProps> {
  protected reactivePipeLine = [this.updateGeometry];
  protected view = new Wireframe();

  private updateGeometry() {
    const { model } = this.props;
    const geometry = new THREE.BoxGeometry(model.size.x, model.size.y, model.size.z);
    const wireframe = new THREE.EdgesGeometry(geometry);
    const material = new LineMaterial({
      color: 0xBF975B,
      linewidth: 0.0025,
    });
    const lineGeo = new LineSegmentsGeometry().fromEdgesGeometry(wireframe);
    this.view.geometry = lineGeo;
    this.view.material = material;
    this.view.computeLineDistances();
    this.view.position.z = model.position.z + 5;
  }
}

interface IFatLineProps {
  position: Vector3;
  rotation: Vector3;
  linePositions: number[];
  dashed?: boolean;
  linewidth?: number;
  color?: number;
  dashScale?: number;
  dashSize?: number;
  gapSize?: number;
  looped?: boolean;
}

export class FatLine extends Mesh3D<IFatLineProps> {
  protected reactivePipeLine = [this.updateGeometry];
  protected view = new Line2();

  private updateGeometry() {
    const { position, rotation, linePositions, dashed = false, linewidth = 0.002, color = 0xBF975B, dashScale = 0.4, dashSize = 1, gapSize = 1, looped = false } = this.props;
    const geometry = new LineGeometry();
    geometry.setPositions(looped ? [...linePositions, linePositions[0], linePositions[1], linePositions[2]] : linePositions);
    const material = new LineMaterial({
      color,
      linewidth: linewidth * ldeStore.scene.canvasZoom > 0.001 ? linewidth : 0.001,
      dashed,
      dashScale: dashScale * ldeStore.scene.canvasZoom > 0.001 ? dashScale : 0.001,
      dashSize: dashSize / ldeStore.scene.canvasZoom,
      gapSize: gapSize / ldeStore.scene.canvasZoom,
      alphaToCoverage: true,
    });
    this.view.geometry = geometry;
    this.view.material = material;
    this.view.position.set(position.x, position.y, position.z + 5);
    this.view.rotation.set(rotation.x, rotation.y, rotation.z);
    this.view.computeLineDistances();
  }
}

interface ICubeProps {
  model: EntityObject;
}

export class Cube extends Mesh3D<ICubeProps> {
  protected reactivePipeLine = [this.updateGeometry];
  protected view = new THREE.Mesh();

  updateGeometry() {
    const geometry = new THREE.BoxGeometry(
      this.props.model.size.x,
      this.props.model.size.y,
      this.props.model.size.z
    );
    const material = new THREE.MeshPhongMaterial({ color: color16() });
    this.view.geometry = geometry;
    this.view.material = material;
    this.view.position.set(0, 0, 0);
  }
}

interface ICircleProps {
  radius: number;
  color?: number;
  imgUrl?: string;
  imgScale?: Vec3;
  scale?: Vec3;
  opacity?: number;
}

export class Circle extends Mesh3D<ICircleProps> {
  protected view = new THREE.Mesh();
  protected reactivePipeLine = [this.updateGeometry, this.updateImage];
  sprite = new THREE.Sprite();

  async updateGeometry() {
    const { scale = { x: 1, y: 1, z: 1 }, radius, color, opacity = 1 } = this.props;
    const geometry = new THREE.CircleGeometry(radius, 32);
    const material = new THREE.MeshBasicMaterial({ color: color || 0xBF975B, opacity, transparent: true });
    (this.view as THREE.Mesh).geometry = geometry;
    (this.view as THREE.Mesh).material = material;
    this.view.scale.set(scale.x / ldeStore.scene.canvasZoom, scale.y / ldeStore.scene.canvasZoom, scale.z / ldeStore.scene.canvasZoom);
  }

  async updateImage() {
    const { imgScale, radius, imgUrl } = this.props;
    if (imgUrl) {
      const spriteMaterial = new THREE.SpriteMaterial();
      const loader = new THREE.TextureLoader();
      loader.setWithCredentials(true);
      const map = await loader.loadAsync(imgUrl).catch((err) => {
        console.error(err);
      });
      if (!map) {
        return;
      }
      spriteMaterial.map = map;
      spriteMaterial.map.minFilter = THREE.LinearFilter;
      this.sprite.scale.set(imgScale?.x || radius * 2 - 5, imgScale?.y || radius * 2 - 5, imgScale?.z || 1);
      this.sprite.material = spriteMaterial;
      this.view.add(this.sprite);
    }
  }
}

interface IClipMaskProps{
  model: ProductEntity;
  points: ClipPointEntity[];
}
export class ClipMask extends Mesh3D<IClipMaskProps> {
  view = new THREE.Mesh();
  protected reactivePipeLine = [this.updateGeometry];
  static material = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.4 });

  updateGeometry() {
    const { x: w, y: h} =  this.props.model.size;
    const { points } =  this.props;

    const shape = new Shape();
    shape.moveTo( - w/2, h / 2);
    shape.lineTo(  w/2, h / 2);
    shape.lineTo(  w/2, -h / 2);
    shape.lineTo( - w/2, -h / 2);

    const hole = new Shape();
    hole.moveTo( points[0].position.x, points[0].position.y);
    hole.lineTo( points[1].position.x, points[1].position.y);
    hole.lineTo( points[2].position.x, points[2].position.y);
    hole.lineTo( points[3].position.x, points[3].position.y);
    shape.holes.push(hole);

    const geometry = new ShapeBufferGeometry(shape);
    this.view.geometry = geometry;
    this.view.material = ClipMask.material;
  }
}


interface IRect3dProps {
  width: number;
  height: number;
  color?: number;
  side?: THREE.Side;
  opacity?: number;
  position?: Vec3;
}

export class Rect3d extends Mesh3D<IRect3dProps> {
  protected reactivePipeLine = [this.updateGeometry];
  protected view = new THREE.Mesh();

  updateGeometry() {
    const { width, height, color, side, opacity = 1, position = { x: 0, y: 0, z: 0 } } = this.props;
    const geometry = new THREE.PlaneGeometry(width / ldeStore.scene.canvasZoom, height / ldeStore.scene.canvasZoom);
    const material = new THREE.MeshBasicMaterial({ color: color || 0xBF975B, opacity, transparent: true, side: side || THREE.DoubleSide });
    this.view.geometry = geometry;
    this.view.material = material;
    this.view.position.x = position.x;
    this.view.position.y = position.y;
    this.view.position.z = position.z;
  }
}

interface ICircle2DProps {
  x?: number;
  y?: number;
  radius: number;
  lineWidth?: number;
  lineColor?: number;
  lineAlpha?: number;
  fillColor?: number;
  fillAlpha?: number;
  alpha?: number;
}

/** 正方形 */
export class Circle2d extends Mesh2D<ICircle2DProps> {
  protected view = new PIXI.Graphics();
  protected reactivePipeLine = [
    this.updateGeometry,
    this.updateMaterial,
    this.updatePosition,
    this.updateRotation,
    this.updateScale,
  ];

  updateGeometry() {
    this.view.clear();
    const {
      x = 0,
      y = 0,
      radius,
      lineWidth = 0,
      lineColor,
      lineAlpha,
      fillColor,
      fillAlpha,
      alpha,
    } = this.props;
    DrawUtils.drawCircle(this.view, {
      cx: x,
      cy: y,
      radius: radius / ldeStore.scene.canvasZoom,
    }, {
      lineWidth: lineWidth / ldeStore.scene.canvasZoom,
      lineColor,
      lineAlpha,
      fillColor,
      fillAlpha,
      alpha,
    });
  }

  updateMaterial() {
    //
  }

  updatePosition() {
    //
  }

  updateRotation() {
    //
  }

  updateScale() {
    //
  }
}

// interface IImageSpriteProps {
//   imgUrl: string;
// }

// export class ImageSprite extends Mesh3D<IImageSpriteProps> {
//   protected view = new THREE.Sprite();
//   protected reactivePipeLine = [this.updateGeometry];

//   async updateGeometry() {
//     const { imgUrl } = this.props;
//     const spriteMaterial = new THREE.SpriteMaterial();
//     const loader = new THREE.TextureLoader();
//     loader.setWithCredentials(true);
//     const map = await loader.loadAsync(imgUrl).catch((err) => {
//       console.error(err);
//     });
//     if (!map) {
//       return;
//     }
//     spriteMaterial.map = map;
//     spriteMaterial.map.minFilter = THREE.LinearFilter;
//     this.view.material = spriteMaterial;
//     this.view.scale.set(map.image.width, map.image.height, 1);
//   }
// }
