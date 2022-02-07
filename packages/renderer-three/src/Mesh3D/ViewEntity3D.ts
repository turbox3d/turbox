import { Mesh3D } from './Mesh3D';

export abstract class ViewEntity3D<Props = {}, State = never> extends Mesh3D<Props, State> {
  protected isViewEntity = true;
}
