import { DocumentDomain } from './domain/document';
import { SceneDomain } from './domain/scene';

export const imageBuilderStore = {
  document: new DocumentDomain(),
  scene: new SceneDomain(),
};
