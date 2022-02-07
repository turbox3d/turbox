import { EntityObject } from '@turbox3d/turbox3d';

export class AssemblyEntity extends EntityObject {
  name = 'assembly';

  setPosition(position: {
    x?: number;
    y?: number;
    z?: number;
  }) {
    super.setPosition(position);
    if (position.z !== undefined) {
      this.children.forEach(child => child.setPosition({
        z: 0,
      }));
    }
    return this;
  }
}
