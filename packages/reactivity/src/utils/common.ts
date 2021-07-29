import { Domain } from '../core/domain';

export function isDomain(value: any): boolean {
  return value instanceof Domain;
}
