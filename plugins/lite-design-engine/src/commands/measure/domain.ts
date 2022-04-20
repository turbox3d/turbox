import { Domain, Vector3, reactor } from '@turbox3d/turbox3d';

export class MeasureDomain extends Domain {
  @reactor() start?: Vector3;
  @reactor() end?: Vector3;

  getLength() {
    if (this.end && this.start) {
      return this.end.subtracted(this.start).length;
    }
    return 0;
  }
}
