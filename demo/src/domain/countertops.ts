import { Domain, mutation, reactor } from '@turbox3d/reactivity-react';
import { Countertop } from './countertop';

export class Countertops extends Domain {
  @reactor countertops: Countertop[];

  @mutation('更新Countertops')
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
