import { ComponentProps } from '@turbox3d/renderer-core';
import { Mesh3D } from './Mesh3D';

export abstract class ViewEntity3D<Props = {}> extends Mesh3D<Props> {
  protected isViewEntity = true;

  constructor(props = {} as ComponentProps<Props>) {
    super(props);
  }
}
