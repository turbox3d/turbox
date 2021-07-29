export const TOLERANCE = 1E-6;
export const TOLERANCE_HALF = TOLERANCE * 0.5;
export const TOLERANCE_SQUARE = TOLERANCE * TOLERANCE;
export const TOLERANCE_SAGITTA = 1;

export class Tolerance {
  static COS_TOL = 1e-6;
  static DIST_TOL = 1e-6;
  static NUM_TOL = 1e-6;
  static global: Tolerance = new Tolerance();
  static setGlobal(cosTol: number, distTol: number, numTol: number) {
    Tolerance.global = new Tolerance(cosTol, distTol, numTol);
  }

  cosTol: number;
  distTol: number;
  numTol: number;

  constructor(cosTol?: number, distTol?: number, numTol?: number) {
    this.cosTol = cosTol || Tolerance.COS_TOL;
    this.distTol = distTol || Tolerance.DIST_TOL;
    this.numTol = numTol || Tolerance.NUM_TOL;
  }

  /**
   * set cosTol by given angle
   * @param angle
   * @param isRadian true means the angle is radian, false means the angle is degree
   */
  setCosTolByAngle(angle: number, isRadian: boolean) {
    const flag: number = isRadian ? 1 : Math.PI / 180;
    this.cosTol = 1 - Math.cos(angle * flag);
  }

  clone() {
    return new Tolerance(this.cosTol, this.distTol, this.numTol);
  }
}
