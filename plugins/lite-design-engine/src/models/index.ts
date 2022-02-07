import { ActionsDomain } from './domain/actions';
import { DocumentDomain } from './domain/document';
import { SceneDomain } from './domain/scene';

export const ldeStore = {
  document: new DocumentDomain(),
  actions: new ActionsDomain(),
  scene: new SceneDomain(),
};
