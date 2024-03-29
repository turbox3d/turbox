export const OBFUSCATED_ERROR =
  'An invariant failed, however the error is obfuscated because this is an production build.';

export function invariant(check: boolean, message?: string | boolean) {
  if (!check) throw new Error(`[turbox]: ${message || OBFUSCATED_ERROR}`);
}

export function fail(message: string | boolean): never {
  invariant(false, message);
  // eslint-disable-next-line no-throw-literal
  throw 'X';
}

export function warn(message: string | boolean) {
  console.warn(`[turbox]: ${message}`);
}
