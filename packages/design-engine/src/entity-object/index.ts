/* eslint-disable no-else-return */
import { computed, Domain, mutation, Reaction, reactive, reactor } from '@turbox3d/reactivity';
import { generateUUID } from '@turbox3d/shared';
import { Box2, Box3, Euler, MathUtils, Matrix3, Matrix4, Quaternion, Vector2, Vector3 } from '@turbox3d/math';

/** 视角类型 */
export enum EPerspectiveType {
  /** 正视 */
  FRONT = 'front',
  /** 顶视 */
  TOP = 'top',
  /** 左视 */
  LEFT = 'left',
}

/**
 *       | y
 *       |
 *       |
 *       |          x
 *       /— — — — — —
 *      /
 *     /
 *    /z
 * 右手坐标系
 */
export default class EntityObject extends Domain {
  static EPerspectiveType = EPerspectiveType;

  private static entityMap = new Map<string, EntityObject>();

  static getEntityById(id: string) {
    return EntityObject.entityMap.get(id);
  }

  @reactor() id: string;
  /** 模型名称 */
  @reactor() name = '';
  /** 模型位置 */
  @reactor() position = new Vector3(0, 0, 0);
  /** 模型旋转角度（注意不是弧度） */
  @reactor() rotation = new Vector3(0, 0, 0);
  /** 模型缩放 */
  @reactor() scale = new Vector3(1, 1, 1);
  /** 模型尺寸 */
  @reactor() size = new Vector3(0, 0, 0);
  /** 模型父节点 */
  @reactor() parent?: EntityObject;
  /** 模型子节点 */
  @reactor() children = new Set<EntityObject>();
  /** 是否隐藏 */
  @reactor() hidden = false;
  /** 是否锁定 */
  @reactor() locked = false;
  /** 是否可被点击 */
  @reactor() isClickable = true;
  /** 是否可被 hover */
  @reactor() isHoverable = true;
  /** 是否可被拖拽 */
  @reactor() isDraggable = true;
  /** 是否可被捏合（移动端） */
  @reactor() isPinchable = true;
  /** 是否可被旋转（移动端） */
  @reactor() isRotatable = true;
  /** 是否可被按压（移动端） */
  @reactor() isPressable = true;
  /** 渲染顺序 */
  @reactor() renderOrder = 0;

  /** 响应式的任务管线 */
  protected reactivePipeLine: Array<{
    func: Function;
    options?: {
      name?: string;
      deps?: Function[];
      immediately?: boolean;
    };
  }> = [];

  private reactions: Reaction[] = [];

  constructor(id = generateUUID()) {
    super();
    this.id = id;
    EntityObject.entityMap.set(this.id, this);
  }

  initDomainContext() {
    return {
      isNeedRecord: true,
    };
  }

  /** 启动响应式任务管线 */
  runReactivePipeLine() {
    this.reactions = this.reactivePipeLine.map(pipe => reactive(() => pipe.func.call(this), pipe.options));
  }

  /** 销毁所有响应式任务管线 */
  disposeReactivePipeLine() {
    this.reactions.forEach(reaction => reaction.dispose());
  }

  /**     back
   *  0---------3
   *  |         |
   *  |left     |right
   *  |         |
   *  1---------2
   *     front
   * 顶视的紧贴包围盒点集合，忽略 x、z 轴旋转
   */
  @computed({ lazy: false })
  get box2Top() {
    return this.getBox2(EPerspectiveType.TOP);
  }

  /** 基于世界坐标系的顶视的紧贴包围盒点集合，忽略 x、z 轴旋转 */
  @computed({ lazy: false })
  get box2TopWCS() {
    return this.getBox2(EPerspectiveType.TOP, true);
  }

  /**
   * 基于世界坐标系的顶视的 AABB 包围盒点集合，忽略 x、z 轴旋转
   */
  @computed({ lazy: false })
  get box2TopAABBWCS() {
    return this.getBox2AABB(EPerspectiveType.TOP, true);
  }

  /**     top
   *  3---------2
   *  |         |
   *  |left     |right
   *  |         |
   *  0---------1
   *     bottom
   * 正视/立面的紧贴包围盒点集合，忽略 x、y 轴旋转
   */
  @computed({ lazy: false })
  get box2Front() {
    return this.getBox2(EPerspectiveType.FRONT);
  }

  /** 基于世界坐标系的正视/立面的紧贴包围盒点集合，忽略 x、y 轴旋转 */
  @computed({ lazy: false })
  get box2FrontWCS() {
    return this.getBox2(EPerspectiveType.FRONT, true);
  }

  /**
   * 基于世界坐标系的正视/立面的 AABB 包围盒点集合，忽略 x、y 轴旋转
   */
  @computed({ lazy: false })
  get box2FrontAABBWCS() {
    return this.getBox2AABB(EPerspectiveType.FRONT, true);
  }

  /**     top
   *  3---------2
   *  |         |
   *  |left     |right
   *  |         |
   *  0---------1
   *     bottom
   * 左视的紧贴包围盒点集合，忽略 y、z 轴旋转
   */
  @computed({ lazy: false })
  get box2Left() {
    return this.getBox2(EPerspectiveType.LEFT);
  }

  /** 基于世界坐标系的左视的紧贴包围盒点集合，忽略 y、z 轴旋转 */
  @computed({ lazy: false })
  get box2LeftWCS() {
    return this.getBox2(EPerspectiveType.LEFT, true);
  }

  /**
   * 基于世界坐标系的左视的 AABB 包围盒点集合，忽略 y、z 轴旋转
   */
  @computed({ lazy: false })
  get box2LeftAABBWCS() {
    return this.getBox2AABB(EPerspectiveType.LEFT, true);
  }

  /**
   *       7-----------6
   *      / .         / |
   *     /  .        /  |
   *    4-----------5   |
   *    |   .       |   |
   *    |   .       |   |
   *    |   0.......|...3
   *    |  .        |  /
   *    | .         | /
   *    1-----------2
   * 三维的紧贴包围盒点集合
   */
  @computed({ lazy: false })
  get box3() {
    return this.getBox3();
  }

  /** 基于世界坐标系的三维的紧贴包围盒点集合 */
  @computed({ lazy: false })
  get box3WCS() {
    return this.getBox3(undefined, true);
  }

  /**
   * 三维的 AABB 包围盒点集合
   */
  @computed({ lazy: false })
  get box3AABB() {
    return this.getBox3AABB();
  }

  /**
   * 基于世界坐标系的三维的 AABB 包围盒点集合
   */
  @computed({ lazy: false })
  get box3AABBWCS() {
    return this.getBox3AABB(undefined, true);
  }

  /** 缩放过的尺寸 */
  @computed({ lazy: false })
  get scaledSize() {
    return this.getScaledSize();
  }

  /** 3x3 entity 顶视矩阵 */
  @computed({ lazy: false })
  get matrix3Top() {
    return this.getMatrix3(EPerspectiveType.TOP);
  }

  /** 3x3 entity 正视/立面矩阵 */
  @computed({ lazy: false })
  get matrix3Front() {
    return this.getMatrix3(EPerspectiveType.FRONT);
  }

  /** 3x3 entity 左视矩阵 */
  @computed({ lazy: false })
  get matrix3Left() {
    return this.getMatrix3(EPerspectiveType.LEFT);
  }

  /** 4x4 entity 矩阵 */
  @computed({ lazy: false })
  get matrix4() {
    return this.getMatrix4();
  }

  @mutation
  setClickable(clickable: boolean) {
    this.isClickable = clickable;
  }

  @mutation
  setHoverable(hoverable: boolean) {
    this.isHoverable = hoverable;
  }

  @mutation
  setDraggable(draggable: boolean) {
    this.isDraggable = draggable;
  }

  @mutation
  setPinchable(pinchable: boolean) {
    this.isPinchable = pinchable;
  }

  @mutation
  setRotatable(rotatable: boolean) {
    this.isRotatable = rotatable;
  }

  @mutation
  setPressable(pressable: boolean) {
    this.isPressable = pressable;
  }

  /** 设置是否可交互 */
  @mutation
  setInteractive(interactive: boolean) {
    this.setClickable(interactive);
    this.setHoverable(interactive);
    this.setDraggable(interactive);
    this.setPinchable(interactive);
    this.setRotatable(interactive);
    this.setPressable(interactive);
  }

  @mutation
  setRenderOrder(renderOrder: number) {
    this.renderOrder = renderOrder;
  }

  /** 锁定 */
  @mutation
  lock() {
    this.locked = true;
    return this;
  }

  /** 解锁 */
  @mutation
  unlock() {
    this.locked = false;
    return this;
  }

  /** 隐藏模型 */
  @mutation
  hide() {
    this.hidden = true;
    return this;
  }

  /** 显示模型 */
  @mutation
  show() {
    this.hidden = false;
    return this;
  }

  /** 设置名称 */
  @mutation
  setName(name: string) {
    this.name = name;
    return this;
  }

  /** 设置一个 4x4 矩阵 */
  @mutation
  setMatrix4(value: Matrix4) {
    const position = new Vector3();
    const quaternion = new Quaternion();
    const scale = new Vector3();
    value.decompose(position, quaternion, scale);
    const rotation = new Euler().setFromQuaternion(quaternion).toVector3();
    this.setPosition(position);
    this.setRotation({ x: rotation.x * MathUtils.RAD2DEG, y: rotation.y * MathUtils.RAD2DEG, z: rotation.z * MathUtils.RAD2DEG });
    this.setScale(scale);
    return this;
  }

  /** 相对于世界坐标系的矩阵 */
  @computed({ lazy: false })
  get concatenatedMatrix(): Matrix4 {
    return this.getConcatenatedMatrix();
  }

  /** 是否是顶层模型 */
  isRoot() {
    return !this.parent;
  }

  /**
   * 获取该模型的顶层模型
   * @param stopCondition 停止查找的条件函数，返回 true 就停下查找
   */
  getRoot(stopCondition?: (currentNode: EntityObject) => boolean) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let root: EntityObject = this;
    while (root.parent && (!stopCondition || !stopCondition(root))) {
      root = root.parent;
    }
    return root;
  }

  /**
   * 遍历
   * @param callback 遍历的处理逻辑函数，返回值是布尔值，如果是 true，则会停止当前遍历到的节点继续往下遍历
   */
  @mutation
  traverse(callback: (current: EntityObject) => boolean | void) {
    const isStop = callback(this);
    if (isStop) {
      return;
    }
    this.children.forEach(child => {
      child.traverse(callback);
    });
  }

  /** 添加子模型 */
  @mutation
  addChild(child: EntityObject) {
    this.children.add(child);
    child.parent = this;
    return this;
  }

  /** 批量添加子模型 */
  @mutation
  addChildren(children: EntityObject[]) {
    children.forEach(child => this.addChild(child));
    return this;
  }

  /** 删除子模型 */
  @mutation
  removeChild(child: EntityObject) {
    child.parent = undefined;
    this.children.delete(child);
    return this;
  }

  /** 批量移除指定的子模型，不传参则移除所有子模型 */
  @mutation
  removeChildren(children?: EntityObject[]) {
    if (!children) {
      this.children.forEach(child => { child.parent = undefined; });
      this.children.clear();
      return this;
    }
    children.forEach(child => this.removeChild(child));
    return this;
  }

  /** 获取该模型与其祖先节点的路径链（从祖先节点到当前模型的顺序） */
  getParentPathChain() {
    const path = [this as EntityObject];
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let t: EntityObject = this;
    while (t.parent) {
      t = t.parent;
      path.unshift(t);
    }
    return path;
  }

  /** 获取模型节点深度 */
  getDepth() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let t: EntityObject = this;
    let result = 1;
    while (t.parent) {
      t = t.parent;
      result += 1;
    }
    return result;
  }

  @mutation
  setPosition(position: { x?: number; y?: number; z?: number }) {
    const { x, y, z } = position;
    x !== undefined && (this.position.x = x);
    y !== undefined && (this.position.y = y);
    z !== undefined && (this.position.z = z);
    return this;
  }

  @mutation
  setRotation(rotation: { x?: number; y?: number; z?: number }) {
    const { x, y, z } = rotation;
    x !== undefined && (this.rotation.x = x);
    y !== undefined && (this.rotation.y = y);
    z !== undefined && (this.rotation.z = z);
    return this;
  }

  @mutation
  setScale(scale: { x?: number; y?: number; z?: number }) {
    const { x, y, z } = scale;
    x !== undefined && (this.scale.x = x);
    y !== undefined && (this.scale.y = y);
    z !== undefined && (this.scale.z = z);
    return this;
  }

  @mutation
  setSize(size: { x?: number; y?: number; z?: number }) {
    const { x, y, z } = size;
    x !== undefined && (this.size.x = x);
    y !== undefined && (this.size.y = y);
    z !== undefined && (this.size.z = z);
    return this;
  }

  getConcatenatedMatrix() {
    const result: Matrix4 = this.getMatrix4().clone();
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let root: EntityObject = this;
    while (root.parent) {
      root = root.parent;
      result.premultiply(root.getMatrix4());
    }
    return result;
  }

  getConcatenatedMatrix3(type: EPerspectiveType) {
    const result: Matrix3 = this.getMatrix3(type).clone();
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let root: EntityObject = this;
    while (root.parent) {
      root = root.parent;
      result.premultiply(root.getMatrix3(type));
    }
    return result;
  }

  getBox2AABB(type: EPerspectiveType, useWCS = false) {
    const points = this.getBox2(type, useWCS);
    const box2 = new Box2().setFromPoints(points);
    return [
      new Vector2(box2.min.x, box2.min.y),
      new Vector2(box2.max.x, box2.min.y),
      new Vector2(box2.max.x, box2.max.y),
      new Vector2(box2.min.x, box2.max.y),
    ];
  }

  /** 把无序的点排序成顺逆时针，只支持凸多边形 */
  clockwisePoints(points: Vector2[], clockwise = false) {
    const newPoints: Vector2[] = [points[0]];
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = newPoints[newPoints.length - 1];
      const waitComparePoints = points.filter(wp => wp !== p1);
      for (let index = 0; index < waitComparePoints.length; index++) {
        const p2 = waitComparePoints[index];
        const v = new Vector2(p2.x - p1.x, p2.y - p1.y);
        const otherPoints = points.filter((p) => p !== p1 && p !== p2);
        const otherVs = otherPoints.map(p => new Vector2(p.x - p1.x, p.y - p1.y));
        const isAllMatched = otherVs.every(ov => (clockwise ? v.cross(ov) < 0 : v.cross(ov) > 0));
        if (isAllMatched) {
          newPoints.push(p2);
          break;
        }
      }
    }
    return newPoints;
  }

  getBox2(type: EPerspectiveType, useWCS = false) {
    const matrix = useWCS ? this.getConcatenatedMatrix() : this.getMatrix4();
    const points = this.getBox3(matrix, useWCS);
    const len = points.length / 2;
    const position = new Vector3();
    const rotation = new Quaternion();
    const scale = new Vector3();
    matrix.decompose(position, rotation, scale);
    const euler = new Euler().setFromQuaternion(rotation);
    const [x, y, z] = euler.toArray().slice(0, 3).map(rad => (rad % (Math.PI / 2)) === 0);
    if (type === EPerspectiveType.TOP) {
      // 顶视图情况下，x 轴、z 轴只要有非 90 度倍数旋转，就得取投影包围盒，否则取真实紧贴包围盒
      if (!x || !z) {
        const box3 = new Box3().setFromPoints(points);
        return [
          new Vector2(box3.min.x, box3.min.z),
          new Vector2(box3.min.x, box3.max.z),
          new Vector2(box3.max.x, box3.max.z),
          new Vector2(box3.max.x, box3.min.z),
        ];
      }
      const newPoints = points.sort((a, b) => b.y - a.y).slice(0, len).map(p => new Vector2(p.x, p.z));
      return this.clockwisePoints(newPoints);
    } else if (type === EPerspectiveType.FRONT) {
      // 正视图情况下，x 轴、y 轴只要有非 90 度倍数旋转，就得取投影包围盒，否则取真实紧贴包围盒
      if (!x || !y) {
        const box3 = new Box3().setFromPoints(points);
        return [
          new Vector2(box3.min.x, box3.min.y),
          new Vector2(box3.max.x, box3.min.y),
          new Vector2(box3.max.x, box3.max.y),
          new Vector2(box3.min.x, box3.max.y),
        ];
      }
      const newPoints = points.sort((a, b) => b.z - a.z).slice(0, len).map(p => new Vector2(p.x, p.y));
      return this.clockwisePoints(newPoints);
    } else if (type === EPerspectiveType.LEFT) {
      // 左视图情况下，z 轴、y 轴只要有非 90 度倍数旋转，就得取投影包围盒，否则取真实紧贴包围盒
      if (!z || !y) {
        const box3 = new Box3().setFromPoints(points);
        return [
          new Vector2(box3.min.z, box3.min.y),
          new Vector2(box3.max.z, box3.min.y),
          new Vector2(box3.max.z, box3.max.y),
          new Vector2(box3.min.z, box3.max.y),
        ];
      }
      const newPoints = points.sort((a, b) => a.x - b.x).slice(0, len).map(p => new Vector2(p.z, p.y));
      return this.clockwisePoints(newPoints);
    }
    return [];
  }

  getRawBox2(type: EPerspectiveType) {
    const box3 = this.getRawBox3();
    if (type === EPerspectiveType.TOP) {
      return [
        new Vector2(box3.min.x, box3.min.z),
        new Vector2(box3.min.x, box3.max.z),
        new Vector2(box3.max.x, box3.max.z),
        new Vector2(box3.max.x, box3.min.z),
      ];
    } else if (type === EPerspectiveType.FRONT) {
      return [
        new Vector2(box3.min.x, box3.min.y),
        new Vector2(box3.max.x, box3.min.y),
        new Vector2(box3.max.x, box3.max.y),
        new Vector2(box3.min.x, box3.max.y),
      ];
    } else if (type === EPerspectiveType.LEFT) {
      return [
        new Vector2(box3.min.z, box3.min.y),
        new Vector2(box3.max.z, box3.min.y),
        new Vector2(box3.max.z, box3.max.y),
        new Vector2(box3.min.z, box3.max.y),
      ];
    }
    return [];
  }

  /**
   * 初始建模包围盒，默认建模原点为几何中心，如需修改请重写该方法
   * @BreakingChange 之前建模原点默认为左后下，现在默认为几何中心（更便于做计算）
   */
  getRawBox3() {
    const size = new Vector3(this.size.x, this.size.y, this.size.z);
    // const original = new Vector3(0.5, 0.5, 0.5);
    const original = new Vector3(0, 0, 0);
    const center = size.clone().multiply(original);
    return new Box3().setFromCenterAndSize(center, size);
  }

  getRawBox3Points() {
    const box3 = this.getRawBox3();
    const points = [
      new Vector3(box3.min.x, box3.min.y, box3.min.z),
      new Vector3(box3.min.x, box3.min.y, box3.max.z),
      new Vector3(box3.max.x, box3.min.y, box3.max.z),
      new Vector3(box3.max.x, box3.min.y, box3.min.z),
      new Vector3(box3.min.x, box3.max.y, box3.max.z),
      new Vector3(box3.max.x, box3.max.y, box3.max.z),
      new Vector3(box3.max.x, box3.max.y, box3.min.z),
      new Vector3(box3.min.x, box3.max.y, box3.min.z),
    ];
    return points;
  }

  getBox3AABB(matrix4?: Matrix4, useWCS = false) {
    const points = this.getBox3(matrix4, useWCS);
    const box3 = new Box3().setFromPoints(points);
    return [
      new Vector3(box3.min.x, box3.min.y, box3.min.z),
      new Vector3(box3.min.x, box3.min.y, box3.max.z),
      new Vector3(box3.max.x, box3.min.y, box3.max.z),
      new Vector3(box3.max.x, box3.min.y, box3.min.z),
      new Vector3(box3.min.x, box3.max.y, box3.max.z),
      new Vector3(box3.max.x, box3.max.y, box3.max.z),
      new Vector3(box3.max.x, box3.max.y, box3.min.z),
      new Vector3(box3.min.x, box3.max.y, box3.min.z),
    ];
  }

  getBox3(matrix4?: Matrix4, useWCS = false) {
    const matrix = matrix4 || (useWCS ? this.getConcatenatedMatrix() : this.getMatrix4());
    const points = this.getRawBox3Points();
    return points.map(point => point.clone().applyMatrix4(matrix));
  }

  getMatrix4(order = 'ZYX') {
    const quaternion = new Quaternion().setFromEuler(
      new Euler(
        this.rotation.x * MathUtils.DEG2RAD,
        this.rotation.y * MathUtils.DEG2RAD,
        this.rotation.z * MathUtils.DEG2RAD,
        order,
      ),
    );
    const position = new Vector3(this.position.x, this.position.y, this.position.z);
    const scale = new Vector3(this.scale.x, this.scale.y, this.scale.z);
    return new Matrix4().compose(position, quaternion, scale);
  }

  getScaledSize() {
    const { x, y, z } = this.size;
    const { x: x1, y: y1, z: z1 } = this.scale;
    return new Vector3(x * x1, y * y1, z * z1);
  }

  getMatrix3(type: EPerspectiveType) {
    const matrix3 = new Matrix3();
    if (type === EPerspectiveType.FRONT) {
      matrix3.compose(new Vector2(this.position.x, this.position.y), this.rotation.z * MathUtils.DEG2RAD, new Vector2(this.scale.x, this.scale.y));
    } else if (type === EPerspectiveType.TOP) {
      matrix3.compose(new Vector2(this.position.x, this.position.z), this.rotation.y * MathUtils.DEG2RAD, new Vector2(this.scale.x, this.scale.z));
    } else if (type === EPerspectiveType.LEFT) {
      matrix3.compose(new Vector2(this.position.z, this.position.y), this.rotation.x * MathUtils.DEG2RAD, new Vector2(this.scale.z, this.scale.y));
    }
    return matrix3;
  }
}
