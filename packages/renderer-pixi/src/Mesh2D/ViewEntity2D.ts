import { Mesh2D } from './Mesh2D';

export abstract class ViewEntity2D<Props = {}, State = never> extends Mesh2D<Props, State> {
  protected isViewEntity = true;
}
