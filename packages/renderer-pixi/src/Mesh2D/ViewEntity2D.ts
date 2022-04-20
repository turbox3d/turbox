import { ComponentProps } from '@turbox3d/renderer-core';
import { Mesh2D } from './Mesh2D';

export abstract class ViewEntity2D<Props = {}> extends Mesh2D<Props> {
  protected isViewEntity = true;

  constructor(props = {} as ComponentProps<Props>) {
    super(props);
  }
}
