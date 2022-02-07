import { ProductEntity } from '../models/entity/product';
import { CubeEntity } from '../models/entity/cube';
import { BackgroundEntity } from '../models/entity/background';
import { ScalePointEntity } from '../models/entity/scalePoint';
import { RotatePointEntity } from '../models/entity/rotatePoint';
import { AssemblyEntity } from '../models/entity/assembly';
import { SkewPointEntity } from '../models/entity/skewPoint';
import { ClipPointEntity } from '../models/entity/clipPoint';
import { AdjustPointEntity } from '../models/entity/adjustPoint';
import { DeletePointEntity } from '../models/entity/deletePoint';

export const EntityCategory = {
  isProduct(value: unknown): value is ProductEntity {
    return value instanceof ProductEntity && !(value instanceof BackgroundEntity);
  },
  isCube(value: unknown): value is CubeEntity {
    return value instanceof CubeEntity;
  },
  isBackground(value: unknown): value is BackgroundEntity {
    return value instanceof BackgroundEntity;
  },
  isScalePoint(value: unknown): value is ScalePointEntity {
    return value instanceof ScalePointEntity;
  },
  isRotatePoint(value: unknown): value is RotatePointEntity {
    return value instanceof RotatePointEntity;
  },
  isAssembly(value: unknown): value is AssemblyEntity {
    return value instanceof AssemblyEntity;
  },
  isSkewPoint(value: unknown): value is SkewPointEntity {
    return value instanceof SkewPointEntity;
  },
  isClipPoint(value: unknown): value is ClipPointEntity {
    return value instanceof ClipPointEntity;
  },
  isAdjustPoint(value: unknown): value is AdjustPointEntity {
    return value instanceof AdjustPointEntity;
  },
  isDeletePoint(value: unknown): value is DeletePointEntity {
    return value instanceof DeletePointEntity;
  },
};
