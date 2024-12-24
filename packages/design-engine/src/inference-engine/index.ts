import { Box2, MathUtils, Matrix3, Vector2 } from '@turbox3d/math';
import EntityObject from '../entity-object';

export default class InferenceEngine {
  /**
   * 旋转吸附
   * @param targetDegree 目标角度
   * @param baseLine 吸附基准线（默认每90度为一个吸附线）
   * @param tolerance 吸附的误差范围（默认15度）
   */
  rotateSnap(targetDegree: number, baseLine = 90, tolerance = 10) {
    let snappedDegree = targetDegree % 360;
    let snapped = false;
    if (Math.abs(snappedDegree % baseLine) <= tolerance) {
      snappedDegree = Math.floor(snappedDegree / baseLine) * baseLine;
      snapped = true;
    } else if (Math.abs(snappedDegree % baseLine) >= baseLine - tolerance) {
      snappedDegree = Math.ceil(snappedDegree / baseLine) * baseLine;
      snapped = true;
    }
    return {
      snappedDegree, // 吸附计算后的角度
      snapped, // 是否应用了吸附效果
    };
  }

  private findClosestPointSorted(target: Vector2, arr: Vector2[], xOrY = true, tolerance?: number) {
    const targetNumber = xOrY ? target.x : target.y;
    let left = 0;
    let right = arr.length - 1;
    const f = (c: number, t: number, o: number) => {
      const minDiff = c - t;
      if (tolerance && Math.abs(minDiff) > tolerance) {
        return {
          minDiff,
          point: undefined,
        };
      }
      return {
        minDiff,
        point: xOrY ? new Vector2(c, o) : new Vector2(o, c),
      };
    };

    const ln = xOrY ? arr[0].x : arr[0].y;
    const rn = xOrY ? arr[arr.length - 1].x : arr[arr.length - 1].y;
    if (targetNumber <= ln) return f(ln, targetNumber, xOrY ? arr[0].y : arr[0].x);
    if (targetNumber >= rn) return f(rn, targetNumber, xOrY ? arr[arr.length - 1].y : arr[arr.length - 1].x);

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const midNumber = xOrY ? arr[mid].x : arr[mid].y;
      if (targetNumber === midNumber) {
        return f(midNumber, targetNumber, xOrY ? arr[mid].y : arr[mid].x);
      }
      if (targetNumber < midNumber) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }

    const leftNumber = xOrY ? arr[left].x : arr[left].y;
    const leftOtherNumber = xOrY ? arr[left].y : arr[left].x;
    const rightNumber = xOrY ? arr[right].x : arr[right].y;
    const rightOtherNumber = xOrY ? arr[right].y : arr[right].x;
    const useLeft = (Math.abs(leftNumber - targetNumber) < Math.abs(rightNumber - targetNumber));
    const closestNumber = useLeft ? leftNumber : rightNumber;
    return f(closestNumber, targetNumber, useLeft ? leftOtherNumber : rightOtherNumber);
  }

  private getEntityMatrix3(entity: EntityObject) {
    const matrix3 = new Matrix3();
    return matrix3.compose(
      new Vector2(entity.position.x, entity.position.y),
      entity.rotation.z * MathUtils.DEG2RAD,
      new Vector2(entity.scale.x, entity.scale.y)
    );
  }

  private getEntityConcatenatedMatrix3(entity: EntityObject) {
    const result = this.getEntityMatrix3(entity).clone();
    let root: EntityObject = entity;
    while (root.parent) {
      root = root.parent;
      result.premultiply(this.getEntityMatrix3(root));
    }
    return result;
  }

  private getEntityBox2AABBWCS(entity: EntityObject) {
    const matrix3 = this.getEntityConcatenatedMatrix3(entity);
    const originalPoints = [
      new Vector2(-entity.size.x / 2, entity.size.y / 2),
      new Vector2(entity.size.x / 2, entity.size.y / 2),
      new Vector2(entity.size.x / 2, -entity.size.y / 2),
      new Vector2(-entity.size.x / 2, -entity.size.y / 2),
    ];
    const points = originalPoints.map(p => p.clone().applyMatrix3(matrix3));
    const box2 = new Box2().setFromPoints(points);
    return [
      new Vector2(box2.min.x, box2.max.y),
      new Vector2(box2.max.x, box2.max.y),
      new Vector2(box2.max.x, box2.min.y),
      new Vector2(box2.min.x, box2.min.y),
    ];
  }

  /**
   * 实体吸附
   */
  entitySnap(targetEntity: EntityObject, snappedEntities: EntityObject[], tolerance = 10) {
    if (!snappedEntities.length) {
      return {
        vertical: undefined,
        verticalDiff: undefined,
        horizontal: undefined,
        horizontalDiff: undefined,
      };
    }
    const f = (entity: EntityObject) => {
      const [p0, p1, p2, p3] = this.getEntityBox2AABBWCS(entity);
      const midX = (p0.x + p1.x) / 2;
      const midY = (p0.y + p3.y) / 2;
      return {
        snapPointsX: [new Vector2(p0.x, midY), new Vector2(midX, midY), new Vector2(p1.x, midY)],
        snapPointsY: [new Vector2(midX, p0.y), new Vector2(midX, midY), new Vector2(midX, p3.y)],
      };
    };
    const { snapPointsX: targetPointsX, snapPointsY: targetPointsY } = f(targetEntity);
    const snappedPointsX = snappedEntities.map(entity => f(entity).snapPointsX).flat().sort((a, b) => a.x - b.x);
    const snappedPointsY = snappedEntities.map(entity => f(entity).snapPointsY).flat().sort((a, b) => a.y - b.y);
    const f2 = (tps: Vector2[], sps: Vector2[], xOrY = true) => {
      const arr = tps.filter(p => this.findClosestPointSorted(p, sps, xOrY, tolerance).point);
      if (!arr.length) {
        return;
      }
      if (arr.length === 1) {
        return this.findClosestPointSorted(arr[0], sps, xOrY, tolerance);
      }
      const tp = arr.reduce((p, c) => {
        const o1 = this.findClosestPointSorted(p, sps, xOrY, tolerance);
        const o2 = this.findClosestPointSorted(c, sps, xOrY, tolerance);
        if (Math.abs(o1.minDiff) <= Math.abs(o2.minDiff)) {
          return p;
        }
        return c;
      });
      return this.findClosestPointSorted(tp, sps, xOrY, tolerance);
    };
    const vertical = f2(targetPointsX, snappedPointsX, true);
    const horizontal = f2(targetPointsY, snappedPointsY, false);
    return {
      vertical: vertical?.point && [new Vector2(vertical.point.x, vertical.point.y), new Vector2(vertical.point.x, targetEntity.position.y)],
      verticalDiff: vertical?.minDiff,
      horizontal: horizontal?.point && [new Vector2(horizontal.point.x, horizontal.point.y), new Vector2(targetEntity.position.x, horizontal.point.y)],
      horizontalDiff: horizontal?.minDiff,
    };
  }
}
