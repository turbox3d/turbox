import { Domain, mutation, reactor } from '@turboo/turbox';
import { Countertop } from './countertop';

export class Countertops extends Domain {
  @reactor countertops: Countertop[];

  @mutation
  updateCountertops(countertops: Countertop[]) {
    this.countertops = countertops;
  }

  constructor({
    countertops,
  }: {
    countertops: Countertop[],
  }) {
    super();
    this.countertops = countertops;
  }
}
