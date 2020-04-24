const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
const uuid = new Array(36);

/**
 * Generates uuid.
 */
export default function generateUUID(): string {
  let rnd = 0;
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      uuid[i] = '-';
    } else if (i === 14) {
      uuid[i] = '4';
    } else {
      if (rnd <= 0x02) {
        /* tslint:disable no-bitwise */
        rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
      }
      const r = rnd & 0xf;
      rnd = rnd >> 4;
      uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r];
    }
  }
  return uuid.join('');
}
